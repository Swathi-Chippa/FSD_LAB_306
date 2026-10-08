const mongoose = require("mongoose");
const XLSX = require("xlsx");


// ==========================================
// MONGODB CONNECTION
// ==========================================

const mongoURL = "mongodb://127.0.0.1:27017/week9";


// ==========================================
// MONGOOSE SCHEMA
// ==========================================

// Subject schema
const subjectSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true
        },

        marks: {
            type: Number,
            required: true
        },

        grade: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


// Student schema
const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        department: {
            type: String,
            required: true
        },

        subjects: {
            type: [subjectSchema],
            required: true
        }
    }
);


// Create Mongoose model
const Student = mongoose.model(
    "Student",
    studentSchema
);


// ==========================================
// MAIN FUNCTION
// ==========================================

async function main() {

    try {

        // ======================================
        // CONNECT TO MONGODB
        // ======================================

        await mongoose.connect(mongoURL);

        console.log("\n====================================");
        console.log("CONNECTED TO MONGODB");
        console.log("====================================");

        console.log("Database: studentDB");


        // ======================================
        // READ EXCEL FILE
        // ======================================

        console.log("\nReading Excel file...");

        const workbook = XLSX.readFile("students.xlsx");

        // Get first Excel sheet
        const sheetName = workbook.SheetNames[0];

        console.log("Sheet:", sheetName);

        // Get worksheet
        const worksheet = workbook.Sheets[sheetName];


        // ======================================
        // CONVERT EXCEL TO JSON
        // ======================================

        const rows = XLSX.utils.sheet_to_json(
            worksheet
        );

        console.log(
            "Excel rows found:",
            rows.length
        );


        // ======================================
        // GROUP DATA BY STUDENT
        // ======================================

        const students = {};

        rows.forEach(row => {

            // Create student if it doesn't exist
            if (!students[row.studentId]) {

                students[row.studentId] = {

                    studentId: row.studentId,

                    name: row.name,

                    department: row.department,

                    subjects: []
                };
            }


            // Add subject
            students[row.studentId].subjects.push({

                subject: row.subject,

                marks: Number(row.marks),

                grade: row.grade

            });

        });


        // Convert object into array
        const studentArray = Object.values(
            students
        );


        console.log(
            "Students found:",
            studentArray.length
        );


        // ======================================
        // REMOVE OLD DATA
        // ======================================

        await Student.deleteMany({});

        console.log(
            "\nOld student data deleted."
        );


        // ======================================
        // INSERT EXCEL DATA INTO MONGODB
        // ======================================

        await Student.insertMany(
            studentArray
        );

        console.log(
            "Excel data inserted into MongoDB."
        );


        // ======================================
        // FETCH DATA FROM MONGODB
        // ======================================

        const studentsFromDB =
            await Student.find().sort({
                studentId: 1
            });


        // ======================================
        // DISPLAY STUDENT DATA
        // ======================================

        console.log("\n====================================");
        console.log("STUDENT DATA FROM MONGODB");
        console.log("====================================");


        studentsFromDB.forEach(student => {

            console.log(
                "\nStudent ID:",
                student.studentId
            );

            console.log(
                "Name:",
                student.name
            );

            console.log(
                "Department:",
                student.department
            );

            console.log("Subjects:");

            student.subjects.forEach(
                subject => {

                    console.log(
                        "   ",
                        subject.subject,
                        "Marks:",
                        subject.marks,
                        "Grade:",
                        subject.grade
                    );

                }
            );

        });


        // ======================================
        // AGGREGATION
        // ======================================

        console.log("\n====================================");
        console.log("STUDENT PERFORMANCE SUMMARY");
        console.log("====================================");


        const result =
            await Student.aggregate([

                // Separate subjects
                {
                    $unwind: "$subjects"
                },


                // Group by student
                {
                    $group: {

                        _id: "$studentId",

                        name: {
                            $first: "$name"
                        },

                        department: {
                            $first: "$department"
                        },

                        totalMarks: {
                            $sum: "$subjects.marks"
                        },

                        averageMarks: {
                            $avg: "$subjects.marks"
                        },

                        highestMarks: {
                            $max: "$subjects.marks"
                        },

                        lowestMarks: {
                            $min: "$subjects.marks"
                        }

                    }
                },


                // Format result
                {
                    $project: {

                        _id: 0,

                        studentId: "$_id",

                        name: 1,

                        department: 1,

                        totalMarks: 1,

                        averageMarks: {
                            $round: [
                                "$averageMarks",
                                2
                            ]
                        },

                        highestMarks: 1,

                        lowestMarks: 1

                    }
                },


                // Highest average first
                {
                    $sort: {
                        averageMarks: -1
                    }
                }

            ]);


        // ======================================
        // DISPLAY SUMMARY
        // ======================================

        console.table(result);


    }
    catch (error) {

        console.error(
            "\nERROR:"
        );

        console.error(error);

    }
    finally {

        // ======================================
        // CLOSE CONNECTION
        // ======================================

        await mongoose.connection.close();

        console.log(
            "\nMongoDB connection closed."
        );

    }
}


// ==========================================
// RUN PROGRAM
// ==========================================

main();