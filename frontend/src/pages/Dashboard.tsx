import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, Circle, Trash2, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../api/api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'DONE';
  dueDate: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalTasks: number;
  totalPages: number;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // El efecto ahora es puro: Solo sincroniza la consulta cuando cambian de valor de forma externa
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let url = `/tasks?page=${page}&limit=5`;
        if (statusFilter !== 'ALL') {
          url += `&status=${statusFilter}`;
        }
        const response = await api.get(url);
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Error al cargar tareas', err);
      }
    };

    fetchTasks();
  }, [page, statusFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    setLoading(true);
    setError('');

    try {
      const isoDueDate = new Date(dueDate).toISOString();
      await api.post('/tasks', { title, description, dueDate: isoDueDate });
      
      setTitle('');
      setDescription('');
      setDueDate('');
      
      // Si no estábamos en la página 1, la cambiamos. Si ya estábamos, forzamos refresco manual
      if (page !== 1) {
        setPage(1);
      } else {
        // Petición rápida de refresco manual sin alterar estados sincrónicamente
        const url = statusFilter !== 'ALL' ? `/tasks?page=1&limit=5&status=${statusFilter}` : '/tasks?page=1&limit=5';
        const response = await api.get(url);
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Error al crear la tarea. Verifica los datos.'+ err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: 'PENDING' | 'DONE') => {
    try {
      const newStatus = currentStatus === 'PENDING' ? 'DONE' : 'PENDING';
      await api.put(`/tasks/${id}`, { status: newStatus });
      
      // Refresco de datos optimizado directo sin alterar la página
      let url = `/tasks?page=${page}&limit=5`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      const response = await api.get(url);
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Error al actualizar estado', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      
      let url = `/tasks?page=${page}&limit=5`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      const response = await api.get(url);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error al eliminar la tarea', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Tareas</h1>
          <p className="text-sm text-gray-500">Bienvenido, {user.name || 'Usuario'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition"
        >
          <LogOut size={16} />
          Salir
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-indigo-600" />
            Nueva Tarea
          </h2>
          {error && <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{error}</p>}
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej. Comprar servidores"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Detalles adicionales..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
            >
              {loading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Filtrar por estado:</span>
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'DONE'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { 
                    setStatusFilter(filter); 
                    setPage(1); // El reset de página ocurre en el click del usuario, no dentro del effect
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    statusFilter === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'ALL' ? 'Todas' : filter === 'PENDING' ? 'Pendientes' : 'Completadas'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No se encontraron tareas para mostrar.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-start gap-3 max-w-[70%]">
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="mt-0.5 text-gray-400 hover:text-indigo-600 transition shrink-0"
                      >
                        {task.status === 'DONE' ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <div>
                        <h3 className={`text-sm font-semibold ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                        <span className="inline-block text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-2">
                          Vence: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((old) => Math.min(old + 1, pagination.totalPages))}
                    disabled={page === pagination.totalPages}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}