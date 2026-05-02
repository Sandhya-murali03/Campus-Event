const cron = require('node-cron');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const { generateParticipantsExcel } = require('./excelGenerator');

// Run every hour to check for expired registration deadlines
const checkRegistrationDeadlines = cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running registration deadline check...');

    const now = new Date();

    // Find approved events where registration deadline has passed but not yet closed
    const expiredEvents = await Event.find({
      status: 'Approved',
      registrationClosed: false,
      lastRegistrationDate: { $lt: now }
    }).populate('createdBy', 'name email');

    console.log(`Found ${expiredEvents.length} events with expired registration deadlines`);

    for (const event of expiredEvents) {
      // Close registration
      event.registrationClosed = true;
      await event.save();

      console.log(`Closed registration for event: ${event.title}`);

      // Get all participants
      const registrations = await Registration.find({
        event: event._id,
        status: 'registered'
      })
        .populate('user', 'name email department year')
        .sort({ registeredAt: 1 });

      const participants = registrations.map(reg => ({
        name: reg.user.name,
        email: reg.user.email,
        department: reg.user.department,
        year: reg.user.year,
        registeredAt: reg.registeredAt
      }));

      console.log(`Event "${event.title}" has ${participants.length} participants`);

      // Generate Excel file if there are participants
      if (participants.length > 0) {
        const result = await generateParticipantsExcel(event.title, participants);

        if (result.success) {
          event.participantsList = result.filepath;
          await event.save();
          console.log(`Generated Excel file for event: ${event.title}`);
        } else {
          console.error(`Failed to generate Excel for event: ${event.title}`, result.error);
        }
      }

      // Notify organizer
      await Notification.create({
        user: event.createdBy._id,
        message: `Registration for your event "${event.title}" has been closed. Total registrations: ${participants.length}`,
        event: event._id,
        type: 'registration_closed'
      });

      // Notify all registered participants
      const participantNotifications = registrations.map(reg => ({
        user: reg.user._id,
        message: `Registration for "${event.title}" is now closed. You are confirmed as a participant!`,
        event: event._id,
        type: 'registration_closed'
      }));

      if (participantNotifications.length > 0) {
        await Notification.insertMany(participantNotifications);
        console.log(`Sent notifications to ${participantNotifications.length} participants`);
      }
    }

    console.log('Registration deadline check completed');
  } catch (error) {
    console.error('Error in registration deadline cron job:', error);
  }
});

// Run every day at midnight to check for upcoming events
const checkUpcomingEvents = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running upcoming events check...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find events happening tomorrow
    const upcomingEvents = await Event.find({
      status: 'Approved',
      eventDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    });

    console.log(`Found ${upcomingEvents.length} events happening tomorrow`);

    for (const event of upcomingEvents) {
      // Get all registered participants
      const registrations = await Registration.find({
        event: event._id,
        status: 'registered'
      });

      // Send reminder notifications
      const reminderNotifications = registrations.map(reg => ({
        user: reg.user,
        message: `Reminder: "${event.title}" is happening tomorrow at ${event.venue}!`,
        event: event._id,
        type: 'general'
      }));

      if (reminderNotifications.length > 0) {
        await Notification.insertMany(reminderNotifications);
        console.log(`Sent ${reminderNotifications.length} reminder notifications for event: ${event.title}`);
      }
    }

    console.log('Upcoming events check completed');
  } catch (error) {
    console.error('Error in upcoming events cron job:', error);
  }
});

// Start all cron jobs
const startCronJobs = () => {
  checkRegistrationDeadlines.start();
  checkUpcomingEvents.start();
  console.log('Cron jobs started successfully');
};

// Stop all cron jobs
const stopCronJobs = () => {
  checkRegistrationDeadlines.stop();
  checkUpcomingEvents.stop();
  console.log('Cron jobs stopped');
};

module.exports = { startCronJobs, stopCronJobs };
