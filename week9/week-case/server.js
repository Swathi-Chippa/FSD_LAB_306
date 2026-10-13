const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

const dbName = "studentDB";
const collectionName = "students";

async function main() {
    try {
        // =========================================
        // CONNECT TO MONGODB
        // =========================================

        await client.connect();

        console.log("\nConnected to MongoDB!");
        console.log("Database:", dbName);
        console.log("Collection:", collectionName);

        // Select database
        const db = client.db(dbName);

        // Select collection
        const collection = db.collection(collectionName);


        // =========================================
        // READ CURRENT DATA
        // =========================================

        const students = await collection.find({}).toArray();

        console.log("\n====================================");
        console.log("CURRENT STUDENT DATA");
        console.log("====================================");

        students.forEach(student => {

            console.log("\nStudent ID:", student.studentId);
            console.log("Name:", student.name);
            console.log("Department:", student.department);

            console.log("Subjects:");

            student.subjects.forEach(subject => {

                console.log(
                    "  ",
                    subject.subject,
                    "Marks:",
                    subject.marks,
                    "Grade:",
                    subject.grade
                );

            });
        });


        // =========================================
        // AGGREGATION
        // =========================================

        console.log("\n====================================");
        console.log("GRADE SUMMARY");
        console.log("====================================");

        const result = await collection.aggregate([

            // Convert subjects array into
            // individual documents
            {
                $unwind: "$subjects"
            },

            // Group subjects by student
            {
                $group: {

                    _id: "$studentId",

                    name: {
                        $first: "$name"
                    },

                    department: {
                        $first: "$department"
                    },

                    // Total marks
                    totalMarks: {
                        $sum: "$subjects.marks"
                    },

                    // Average marks
                    averageMarks: {
                        $avg: "$subjects.marks"
                    },

                    // Highest mark
                    highestMarks: {
                        $max: "$subjects.marks"
                    },

                    // Lowest mark
                    lowestMarks: {
                        $min: "$subjects.marks"
                    }
                }
            },

            // Format the output
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

            // Sort by average marks
            // Highest first
            {
                $sort: {
                    averageMarks: -1
                }
            }

        ]).toArray();


        // =========================================
        // DISPLAY AGGREGATION RESULT
        // =========================================

        console.log("\nStudent Performance Summary:");

        console.table(result);


    } catch (error) {

        console.error("\nMongoDB Error:");
        console.error(error);

    } finally {

        // Close MongoDB connection
        await client.close();

        console.log("\nMongoDB connection closed.");
    }
}


// Run program
main();