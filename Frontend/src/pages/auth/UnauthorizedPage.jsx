import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
            <p className="text-xl font-semibold text-gray-700 mb-2">Access Denied</p>
            <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
            <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Go Back
            </button>
        </div>
    );
};

export default UnauthorizedPage;
