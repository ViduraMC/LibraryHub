import MembershipRequest from "../models/membershipRequest.model.js";
import SchoolList from "../models/schoolList.model.js";

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
