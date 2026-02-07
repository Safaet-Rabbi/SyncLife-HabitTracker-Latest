import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../features/tuition/tuitionSlice';
import { Users, CalendarDays } from 'lucide-react'; // Assuming Lucide-React is installed

const StatsWidget = () => {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading, error } = useSelector((state) => state.tuition);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading) return <div className="text-center p-4 dark:text-gray-200">Loading stats...</div>;
  if (error) return <div className="text-center p-4 text-red-500 dark:text-red-400">Error: {error}</div>;

  return (
    <div className="mb-6">
      <div className="bg-white/95 dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center">
          <Users className="text-blue-600 dark:text-blue-400 mr-4" size={32} />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.totalStudents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
