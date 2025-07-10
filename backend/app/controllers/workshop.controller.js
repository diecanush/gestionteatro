const db = require('../models');
const Workshop = db.workshops;
const Student = db.students;

// Retrieve all Workshops from the database, including their students.
exports.findAll = (req, res) => {
    Workshop.findAll({ 
        include: [{
            model: Student,
            as: 'students'
        }],
        order: [['name', 'ASC']]
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving workshops.'
        });
    });
};

// Find a single Workshop with an id, including its students.
exports.findOne = (req, res) => {
    const id = req.params.id;
    Workshop.findByPk(id, { include: ['students'] })
    .then(data => {
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find Workshop with id=${id}.`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: 'Error retrieving Workshop with id=' + id
        });
    });
};

// Add a student to a workshop
exports.addStudent = (req, res) => {
    const workshopId = req.params.workshopId;
    const { firstName, lastName, birthDate, phone, email } = req.body;

    if (!firstName || !lastName) {
        res.status(400).send({ message: 'First name and last name cannot be empty!' });
        return;
    }

    // Check if workshop exists first
    Workshop.findByPk(workshopId)
    .then(workshop => {
        if (!workshop) {
            return res.status(404).send({ message: 'Workshop not found.' });
        }
        // Create student and associate with workshop
        Student.create({
            firstName,
            lastName,
            birthDate,
            phone,
            email,
            workshopId: workshop.id
        })
        .then(student => {
            res.status(201).send(student);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Some error occurred while creating the Student.'
            });
        });
    })
    .catch(err => {
        res.status(500).send({
            message: 'Error finding Workshop with id=' + workshopId
        });
    });
};
