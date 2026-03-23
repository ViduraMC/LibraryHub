import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginUser } from '../../api/auth.api.js';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // toggle between email login (admin/librarian) and membershipId login (student/teacher)
    const [loginType, setLoginType] = useState('email'); // 'email' or 'membership'
    const [formData, setFormData] = useState({ email: '', membershipId: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const credentials =
            loginType === 'email'
                ? { email: formData.email, password: formData.password }
                : { membershipId: formData.membershipId, password: formData.password };

        try {
            const res = await loginUser(credentials);
            const { token, user } = res.data;

            login(user, token);
            toast.success(`Welcome back, ${user.fullName}!`);

            // redirect based on role
            if (user.role === 'student' || user.role === 'teacher') {
                navigate('/my-transactions');
            } else {
                navigate('/transactions');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Check credentials.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                {/* header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">LibraryHub</h1>
                    <p className="text-gray-500 mt-1">School Library Management System</p>
                </div>

                {/* login type toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
                    <button
                        type="button"
                        onClick={() => setLoginType('email')}
                        className={`flex-1 py-2 text-sm font-medium transition ${
                            loginType === 'email'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Admin / Librarian
                    </button>
                    <button
                        type="button"
                        onClick={() => setLoginType('membership')}
                        className={`flex-1 py-2 text-sm font-medium transition ${
                            loginType === 'membership'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Student / Teacher
                    </button>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {loginType === 'email' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@libraryhub.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Membership ID
                            </label>
                            <input
                                type="text"
                                name="membershipId"
                                value={formData.membershipId}
                                onChange={handleChange}
                                required
                                placeholder="ST-26-0001 or TH-26-0001"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
