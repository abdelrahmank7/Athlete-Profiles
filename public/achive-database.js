const archiveOldNotes = (thresholdDate) => {
  athletesDb.find({}, (err, athletes) => {
    if (err) return console.error(err);

    athletes.forEach((athlete) => {
      const oldNotes = athlete.notes.filter(
        (note) => new Date(note.date) < thresholdDate
      );

      if (oldNotes.length > 0) {
        archiveDb.insert(oldNotes, (err) => {
          if (err) return console.error(err);

          athletesDb.update(
            { _id: athlete._id },
            {
              $pull: {
                notes: {
                  date: { $lt: thresholdDate.toISOString().split("T")[0] },
                },
              },
            },
            {},
            (err) => {
              if (err) return console.error(err);
              console.log(
                `Archived ${oldNotes.length} notes for athlete ${athlete._id}`
              );
            }
          );
        });
      }
    });
  });
};

// Call this function periodically, e.g., once a month
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
archiveOldNotes(oneYearAgo);
