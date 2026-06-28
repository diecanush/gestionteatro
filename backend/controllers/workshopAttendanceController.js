import Workshop from '../models/Workshop.js';
import Student from '../models/Student.js';
import WorkshopAttendance from '../models/WorkshopAttendance.js';
import { Op } from 'sequelize';

// Get attendance for a workshop in a date range
export const getAttendanceByWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause = { workshop_id: workshopId };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const attendance = await WorkshopAttendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['date', 'ASC'], ['student', 'lastName', 'ASC']],
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error al obtener la asistencia', error: error.message });
  }
};

// Get attendance for a specific student in a workshop
export const getStudentAttendance = async (req, res) => {
  try {
    const { workshopId, studentId } = req.params;

    const attendance = await WorkshopAttendance.findAll({
      where: {
        workshop_id: workshopId,
        student_id: studentId,
      },
      order: [['date', 'ASC']],
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record or update attendance
export const recordAttendance = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { date, attendance } = req.body;

    if (!date || !attendance || !Array.isArray(attendance)) {
      return res.status(400).json({
        message: 'Se requiere fecha y lista de asistencia',
      });
    }

    const results = [];

    for (const record of attendance) {
      const { studentId, status, notes } = record;

      if (!studentId || !status) continue;

      // Use upsert to create or update
      const [attendanceRecord, created] = await WorkshopAttendance.upsert({
        workshop_id: workshopId,
        student_id: studentId,
        date,
        status,
        notes: notes || null,
      }, {
        returning: true,
      });

      results.push({
        studentId,
        status,
        created,
      });
    }

    res.status(200).json({
      message: 'Asistencia registrada correctamente',
      records: results,
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Error al registrar asistencia', error: error.message });
  }
};

// Update a single attendance record
export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;

    const attendance = await WorkshopAttendance.findByPk(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
    }

    attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const deleted = await WorkshopAttendance.destroy({
      where: { id: attendanceId },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Registro de asistencia no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get class days for a workshop (calculated from classDays field and dates)
export const getClassDays = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { month, year } = req.query;

    const workshop = await Workshop.findByPk(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    // Parse class days from JSON string
    let classDaysArray = [];
    if (workshop.classDays) {
      try {
        classDaysArray = JSON.parse(workshop.classDays);
      } catch (e) {
        // If not valid JSON, treat as comma-separated
        classDaysArray = workshop.classDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      }
    }

    // If no class days defined, return empty
    if (classDaysArray.length === 0) {
      return res.json({
        classDays: [],
        message: 'El taller no tiene días de clase definidos',
      });
    }

    // Calculate dates for the requested month/year
    const targetMonth = parseInt(month) - 1; // JS months are 0-based
    const targetYear = parseInt(year);
    
    const dates = [];
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

    // Workshop date range
    const workshopStart = workshop.startDate ? new Date(workshop.startDate) : null;
    const workshopEnd = workshop.endDate ? new Date(workshop.endDate) : null;

    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      if (classDaysArray.includes(dayOfWeek)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Check if within workshop dates
        let isActive = true;
        if (workshopStart && d < workshopStart) isActive = false;
        if (workshopEnd && d > workshopEnd) isActive = false;

        dates.push({
          date: dateStr,
          dayOfWeek,
          isActive,
        });
      }
    }

    res.json({
      classDays: classDaysArray,
      dates,
      workshopStartDate: workshop.startDate,
      workshopEndDate: workshop.endDate,
    });
  } catch (error) {
    console.error('Error getting class days:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get attendance summary for a workshop
export const getAttendanceSummary = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause = { workshop_id: workshopId };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const attendance = await WorkshopAttendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    // Calculate summary per student
    const summary = {};
    
    for (const record of attendance) {
      const studentId = record.student_id;
      if (!summary[studentId]) {
        summary[studentId] = {
          student: record.student,
          present: 0,
          absent: 0,
          total: 0,
        };
      }
      
      summary[studentId].total++;
      if (record.status === 'P') {
        summary[studentId].present++;
      } else {
        summary[studentId].absent++;
      }
    }

    res.json(Object.values(summary));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
