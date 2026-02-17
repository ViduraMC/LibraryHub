import crypto from "crypto";
import MembershipRequest from "../models/membershipRequest.model.js";
import SchoolList from "../models/schoolList.model.js";
import Student from "../models/user/student.model.js";
import Teacher from "../models/user/teacher.model.js";
import sendEmail from "../config/email.js";

// submit a membership request (public - no auth required)
// student/teacher fills the registration form
export const submitRequest = async (req, res) => {
    try {
        const {
            applicantType,
            studentId,
            teacherId,
            fullName,
            email,
            phone,
            address,
            profileImageURL,
            grade,
            classRoom,
            guardianName,
            guardianPhone,
            subject,
        } = req.body;

        // validate required fields
        if (!applicantType || !fullName || !email) {
            return res.status(400).json({
                success: false,
                message: "Applicant type, full name and email are required",
            });
        }

        // validate applicant type specific ID
        const schoolId = applicantType === "student" ? studentId : teacherId;
        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: `${applicantType === "student" ? "Student" : "Teacher"} ID is required`,
            });
        }

        // check if a request with same school ID already exists
        const existingRequest = await MembershipRequest.findOne({
            applicantType,
            ...(applicantType === "student" ? { studentId } : { teacherId }),
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: `A request with this ${applicantType} ID already exists. Status: ${existingRequest.status}`,
            });
        }

        // auto-verify against school list
        const schoolRecord = await SchoolList.findOne({
            type: applicantType,
            schoolId: schoolId,
        });

        // if ID not found in school list, reject immediately
        if (!schoolRecord) {
            return res.status(400).json({
                success: false,
                message: `${applicantType === "student" ? "Student" : "Teacher"} ID "${schoolId}" not found in school records. Registration denied`,
            });
        }

        // ID found in school list - create verified request
        // build request data (only include relevant ID field to avoid sparse index conflicts)
        const requestData = {
            applicantType,
            fullName,
            email,
            phone,
            address,
            profileImageURL,
            status: "verified",
            verifiedAt: new Date(),
        };

        // add type-specific fields
        if (applicantType === "student") {
            requestData.studentId = studentId;
            requestData.grade = grade;
            requestData.classRoom = classRoom;
            requestData.guardianName = guardianName;
            requestData.guardianPhone = guardianPhone;
        } else {
            requestData.teacherId = teacherId;
            requestData.subject = subject;
        }

        // create the request
        const request = await MembershipRequest.create(requestData);

        res.status(201).json({
            success: true,
            message: "Request submitted and verified. Waiting for librarian approval",
            request,
        });
    } catch (error) {
        console.error("Submit request error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// get all membership requests (librarian/admin)
// can filter by status using query param: ?status=verified
export const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await MembershipRequest.find(filter)
            .sort({ createdAt: -1 })
            .populate("approvedBy", "fullName email");

        res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    } catch (error) {
        console.error("Get requests error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// get single request by ID (librarian/admin)
export const getRequestById = async (req, res) => {
    try {
        const request = await MembershipRequest.findById(req.params.id)
            .populate("approvedBy", "fullName email");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        res.status(200).json({
            success: true,
            request,
        });
    } catch (error) {
        console.error("Get request error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// helper: generate membership ID like ST-26-0001, TH-26-0001
const generateMembershipId = async (applicantType) => {
    const prefix = applicantType === "student" ? "ST" : "TH";
    const year = new Date().getFullYear().toString().slice(-2);

    // count existing approved requests of this type to get the next number
    const count = await MembershipRequest.countDocuments({
        applicantType,
        status: { $in: ["approved", "active"] },
    });

    const nextNum = String(count + 1).padStart(4, "0");
    return `${prefix}-${year}-${nextNum}`;
};

// approve a membership request (librarian only)
export const approveRequest = async (req, res) => {
    try {
        const request = await MembershipRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        // only verified requests can be approved
        if (request.status !== "verified") {
            return res.status(400).json({
                success: false,
                message: `Cannot approve request with status "${request.status}". Only verified requests can be approved`,
            });
        }

        // generate membership ID
        const membershipId = await generateMembershipId(request.applicantType);

        // generate password set token (valid for 7 days)
        const passwordSetToken = crypto.randomBytes(32).toString("hex");
        const passwordSetTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // update request with approval details
        request.status = "approved";
        request.approvedAt = new Date();
        request.approvedBy = req.user._id;
        request.membershipId = membershipId;
        request.passwordSetToken = passwordSetToken;
        request.passwordSetTokenExpiry = passwordSetTokenExpiry;
        await request.save();

        // send email with membership ID and set-password link
        const setPasswordLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/set-password?token=${passwordSetToken}`;

        const emailHtml = `
            <h2>Welcome to LibraryHub!</h2>
            <p>Hello <strong>${request.fullName}</strong>,</p>
            <p>Your membership request has been <strong>approved</strong>. Here are your details:</p>
            <ul>
                <li><strong>Membership ID:</strong> ${membershipId}</li>
                <li><strong>Role:</strong> ${request.applicantType}</li>
            </ul>
            <p>Please set your password by clicking the link below:</p>
            <a href="${setPasswordLink}" style="display:inline-block;padding:12px 24px;background:#4CAF50;color:white;text-decoration:none;border-radius:6px;">
                Set Your Password
            </a>
            <p style="margin-top:16px;color:#888;">This link expires in 7 days.</p>
            <br>
            <p>Best regards,<br>LibraryHub Team</p>
        `;

        const emailSent = await sendEmail(
            request.email,
            "LibraryHub - Your Membership Has Been Approved!",
            emailHtml
        );

        res.status(200).json({
            success: true,
            message: emailSent
                ? "Request approved, membership ID generated, and email sent"
                : "Request approved but email sending failed",
            membershipId,
            request,
        });
    } catch (error) {
        console.error("Approve request error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// reject a membership request (librarian only)
export const rejectRequest = async (req, res) => {
    try {
        const { reason } = req.body;

        const request = await MembershipRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        // only verified requests can be rejected by librarian
        if (request.status !== "verified") {
            return res.status(400).json({
                success: false,
                message: `Cannot reject request with status "${request.status}". Only verified requests can be rejected`,
            });
        }

        // update request
        request.status = "rejected";
        request.rejectionReason = reason || "No reason provided";
        await request.save();

        // send rejection email
        const emailHtml = `
            <h2>LibraryHub - Membership Request Update</h2>
            <p>Hello <strong>${request.fullName}</strong>,</p>
            <p>Unfortunately, your membership request has been <strong>rejected</strong>.</p>
            <p><strong>Reason:</strong> ${request.rejectionReason}</p>
            <p>If you think this is a mistake, please contact the library administration.</p>
            <br>
            <p>Best regards,<br>LibraryHub Team</p>
        `;

        await sendEmail(
            request.email,
            "LibraryHub - Membership Request Rejected",
            emailHtml
        );

        res.status(200).json({
            success: true,
            message: "Request rejected",
            request,
        });
    } catch (error) {
        console.error("Reject request error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
