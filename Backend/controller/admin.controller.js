import Librarian from "../models/user/librarian.model.js";
import User from "../models/user/user.model.js";
import sendEmail from "../config/email.js";

// create a new librarian (admin only)
export const createLibrarian = async (req, res) => {
    try {
        const { fullName, email, phone, address } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: "Full name and email are required",
            });
        }

        // make sure no duplicate email
        const existingUser = await Librarian.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists",
            });
        }

        // auto-generate a temp password — the librarian will receive it via email
        const tempPassword = `Lib@${Date.now().toString().slice(-6)}`;

        const librarian = await Librarian.create({
            fullName,
            email,
            password: tempPassword,
            phone: phone || "",
            address: address || "",
            role: "librarian",
        });

        // email the login credentials to the new librarian
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

        // never send the password back to the client
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
        console.error("Create librarian error:", error);
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

// update librarian details (admin only)
export const updateLibrarian = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, address } = req.body;

        const librarian = await Librarian.findById(id);
        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found",
            });
        }

        // if email is changing, check it's not already taken by someone else
        if (email && email.toLowerCase() !== librarian.email) {
            const emailTaken = await User.findOne({ email: email.toLowerCase() });
            if (emailTaken) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already in use by another account",
                });
            }
        }

        // only update provided fields
        if (fullName) librarian.fullName = fullName;
        if (email) librarian.email = email;
        if (phone !== undefined) librarian.phone = phone;
        if (address !== undefined) librarian.address = address;

        await librarian.save();

        const result = librarian.toObject();
        delete result.password;

        res.status(200).json({
            success: true,
            message: "Librarian updated successfully",
            librarian: result,
        });
    } catch (error) {
        console.error("Update librarian error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// toggle librarian active/inactive status (admin only)
export const toggleLibrarianStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const librarian = await Librarian.findById(id);
        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found",
            });
        }

        // flip the boolean
        librarian.isActive = !librarian.isActive;
        await librarian.save();

        const result = librarian.toObject();
        delete result.password;

        res.status(200).json({
            success: true,
            message: librarian.isActive
                ? "Librarian account activated"
                : "Librarian account deactivated",
            librarian: result,
        });
    } catch (error) {
        console.error("Toggle librarian status error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// permanently delete a librarian account (admin only)
export const deleteLibrarian = async (req, res) => {
    try {
        const { id } = req.params;

        const librarian = await Librarian.findByIdAndDelete(id);
        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Librarian account deleted permanently",
        });
    } catch (error) {
        console.error("Delete librarian error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// search for a user by their membershipId (admin/librarian)
// used by BorrowBookPage to look up a member for issuing books
export const searchUserByMembershipId = async (req, res) => {
    try {
        const { membershipId } = req.query;

        if (!membershipId) {
            return res.status(400).json({
                success: false,
                message: "membershipId query parameter is required",
            });
        }

        // case-insensitive search on the membershipId field
        const user = await User.findOne({
            membershipId: membershipId.trim().toUpperCase(),
        }).select("fullName role membershipId isActive");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No user found with membership ID: ${membershipId}`,
            });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Search user error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
