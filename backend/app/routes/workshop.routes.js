module.exports = app => {
    const workshops = require('../controllers/workshop.controller.js');
    const router = require('express').Router();
    
    // Retrieve all Workshops, including their students
    router.get('/', workshops.findAll);
    
    // Retrieve a single Workshop with id
    router.get('/:id', workshops.findOne);

    // Add a student to a specific workshop
    router.post('/:workshopId/students', workshops.addStudent);

    app.use('/api/workshops', router);
};
