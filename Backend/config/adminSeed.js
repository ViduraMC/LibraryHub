import Admin from "../models/user/admin.model.js";

const seedAdmin = async () => {
    try {
        // check if admin already exists
        const existingAdmin = await Admin.findOne({ role: "admin" });

        if (existingAdmin) {
            console.log("Admin already exists, skipping seed");
            return;
        }

        // create default admin
        const admin = await Admin.create({
            fullName: "System Admin",
            email: "admin@libraryhub.com",
            password: "Admin@123",
            role: "admin",
        });

        console.log(`Default admin seeded: ${admin.email}`);
    } catch (error) {
        console.error("Error seeding admin:", error.message);
    }
};

export default seedAdmin;
