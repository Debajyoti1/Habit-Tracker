const Habit = require('../models/habitModel');

const Month = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Controller for habits page
module.exports.habitsPage = async (req, res) => {
  try {
    const habits = await Habit.find();
    return res.render('dashboard', {
      title: 'Habits Dashboard',
      habits: habits
    });
  } catch (err) {
    console.error(err);
    return res.redirect('/');
  }
};

// Create a new habit
module.exports.create = async (req, res) => {
  const today = new Date();
  const date = today.getDate();
  try {
    console.log(req.body);
    await Habit.create({
      description: req.body.habit,
      creation_date: date,
      days: ['None', 'None', 'None', 'None', 'None', 'None', 'None'],
      completed: 0,
      streak: 0
    });
    return res.redirect('back');
  } catch (err) {
    console.log('Error while creating Habit:', err);
    return res.redirect('back');
  }
};

// Delete a habit
module.exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    await Habit.findByIdAndDelete(id);
    console.log('Successfully deleted Habit');
    return res.redirect('back');
  } catch (err) {
    console.log('Error deleting from the database');
    return res.redirect('back');
  }
};

// Check the weekly view
module.exports.weeklyView = async (req, res) => {
  try {
    const date = new Date();
    const days = [];
    //Get dates for past 7 day in date array
    for (let i = 0; i < 7; i++) {
      const d = `${date.getDate()}, ${Month[date.getMonth()]} ${date.getFullYear()}`;
      date.setDate(date.getDate() - 1);
      days.push(d);
    }
    days.reverse();
    const habits = await Habit.find({});
    updateData(habits);
    return res.render('weeklyview', {
      title: 'Habits Weekly View',
      habits: habits,
      days: days
    });
  } catch (error) {
    console.log('Error while fetching data from the database:', error);
    return res.redirect('/');
  }
};

// Update habit status
module.exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const day = req.params.day;
    const status = req.params.status;
    const habit = await Habit.findById(id);
    habit.days[day] = status;
    await habit.save();
    updateStreakAndCompleted(habit);
    return res.redirect('back');
  } catch (error) {
    console.log(error);
    return res.redirect('back');
  }
};

// Update habit data
const updateData = (habits) => {
  const todayDate = new Date().getDate();
  // Loop through each habit
  for (const habit of habits) {
    const id = habit.id;
    const diff = todayDate - habit.creation_date;

    // Check if habit needs to be updated within the last 7 days
    if (diff > 0 && diff < 8) {
      // Update habit's days array based on the difference in dates
      for (let i = diff, j = 0; i < habit.days.length; i++, j++) {
        habit.days[j] = habit.days[i];
      }

      // Set remaining positions in the days array to 'None'
      const remainingPos = habit.days.length - diff;
      for (let i = remainingPos; i < habit.days.length; i++) {
        habit.days[i] = 'None';
      }

      // Update habit's creation date, streak, and completed status
      habit.creation_date = todayDate;
      updateStreakAndCompleted(habit);

      // Save the updated habit
      habit.save();
    }
    // Check if habit needs to be reset after 7 days
    else if (diff > 7) {
      // Reset habit's days array to 'None' for the last 7 days
      for (let i = 0; i < 7; i++) {
        habit.days[i] = 'None';

        // Update habit's creation date, streak, and completed status
        habit.creation_date = todayDate;
        updateStreakAndCompleted(habit);

        // Save the updated habit
        habit.save();
      }
    }
  }
};

// Update streak and completion status of a habit
const updateStreakAndCompleted = async (habit) => {
  try {
    let currCompleted = 0;
    let maxStreak = 0;
    let currStreak = 0;

    // Iterate through each day in the habit's days array
    for (let i = 0; i < habit.days.length; i++) {
      if (habit.days[i] === 'Done') {
        // Increment current completed count and streak
        currCompleted++;
        currStreak++;
      } else {
        // Check if current streak is longer than the maximum streak
        if (currStreak > maxStreak) {
          maxStreak = currStreak;
          currStreak = 0;
        } else {
          currStreak = 0;
        }
      }
    }

    // Check if the last streak is longer than the maximum streak
    if (currStreak > maxStreak) {
      maxStreak = currStreak;
    }

    // Update the habit's streak and completed count in the database
    await Habit.findByIdAndUpdate(habit.id, {
      streak: maxStreak,
      completed: currCompleted
    });
  } catch (error) {
    console.log(error);
  }
};