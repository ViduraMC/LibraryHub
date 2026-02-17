import Librarian from "../models/user/librarian.model.js";
import sendEmail from "../config/email.js";

// create a new librarian (admin only)
export const createLibrarian = async (req, res) => {
    try {
        const { fullName, email, phone, address } = req.body;

        // validate required fields
        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: "Full name and email are required",
            });
        }

        // check if email already exists
        const existingUser = await Librarian.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists",
            });
        }

        // generate a temporary password
        const tempPassword = `Lib@${Date.now().toString().slice(-6)}`;

        // create librarian
        const librarian = await Librarian.create({
            fullName,
            email,
            password: tempPassword,
            phone: phone || "",
            address: address || "",
            role: "librarian",
        });

        // send email with credentials
        const emailHtml = `
            <h2>Welcome to LibraryHub!</h2>
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Your librarian account has been created. Here are your login credentials:</p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Temporary Password:</strong> ${tempPassword}</li>
            </ul>
            <p>Please change your password after first login.</p>
            <br>
            <p>Best regards,<br>LibraryHub Admin</p>
        `;

        const emailSent = await sendEmail(email, "LibraryHub - Your Librarian Account", emailHtml);

        // remove password from response
        const librarianResponse = librarian.toObject();
        delete librarianResponse.password;

        res.status(201).json({
            success: true,
            message: emailSent
                ? "Librarian created and credentials sent via email"
                : "Librarian created but email sending failed",
            librarian: librarianResponse,
        });
    } catch (error) {
        console.error("Create librarian error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// get all librarians (admin only)
export const getAllLibrarians = async (req, res) => {
    try {
        const librarians = await Librarian.find().select("-password");

        res.status(200).json({
            success: true,
            count: librarians.length,
            librarians,
        });
    } catch (error) {
        console.error("Get librarians error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
