import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addStudent } from '../../features/tuition/tuitionSlice';
import { X, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const StudentForm = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.tuition);

  const [formData, setFormData] = useState({
    name: '',
    className: '',
    subjectCount: '',
    location: '',
    monthlyFee: '',
    joinedDate: new Date().toISOString().split('T')[0], // Default to today
  });

  useEffect(() => {
    if (error) {
      toast.error(`Error adding student: ${error}`);
    }
  }, [error]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.className || !formData.subjectCount || !formData.location) {
      toast.error('Please fill in all required fields (Name, Class, Subject Count, Location).');
      return;
    }

    const newStudentData = {
      ...formData,
      subjectCount: Number(formData.subjectCount),
      monthlyFee: formData.monthlyFee ? Number(formData.monthlyFee) : undefined,
    };

    try {
      await dispatch(addStudent(newStudentData)).unwrap();
      toast.success('Student added successfully!');
      setFormData({ // Reset form
        name: '',
        className: '',
        subjectCount: '',
        location: '',
        monthlyFee: '',
        joinedDate: new Date().toISOString().split('T')[0],
      });
      onClose(); // Close modal on success
    } catch (err) {
      // Error handled by useEffect and toast already
      console.error("Failed to add student:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <UserPlus className="mr-2" /> Add New Student
          </h2>
          <button
            onClick={onClose}
            className="close-btn"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="className">Class</label>
            <input
              type="text"
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subjectCount">Subject Count</label>
            <input
              type="number"
              id="subjectCount"
              name="subjectCount"
              value={formData.subjectCount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="monthlyFee">Monthly Fee (Optional)</label>
            <input
              type="number"
              id="monthlyFee"
              name="monthlyFee"
              value={formData.monthlyFee}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="joinedDate">Joined Date</label>
            <input
              type="date"
              id="joinedDate"
              name="joinedDate"
              value={formData.joinedDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <UserPlus className="h-5 w-5 mr-2" />
              )}
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
