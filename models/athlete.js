class Athlete {
  constructor(
    id,
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage
  ) {
    this.id = id;
    this.name = name;
    this.birthdate = birthdate;
    this.weight = weight;
    this.targetWeight = targetWeight;
    this.height = height;
    this.club = club;
    this.sport = sport;
    this.currentWeight = currentWeight || null;
    this.fatsPercentage = fatsPercentage || null;
    this.musclePercentage = musclePercentage || null;
    this.notes = [];
    this.supplementNotes = [];
    this.appointments = [];
    this.history = [];
  }

  addNote(note) {
    this.notes.push({ date: new Date().toISOString(), note });
  }

  addSupplement(note) {
    this.supplementNotes.push({ date: new Date().toISOString(), note });
  }

  addAppointment(date, tournamentName) {
    this.appointments.push({ date, tournamentName });
  }

  addHistoryRecord(record) {
    this.history.push(record);
  }

  static fromRow(row) {
    const athlete = new Athlete(
      row.id,
      row.name,
      row.birthdate,
      row.weight,
      row.targetWeight,
      row.height,
      row.club,
      row.sport,
      row.currentWeight,
      row.fatsPercentage,
      row.musclePercentage
    );
    return athlete;
  }
}

module.exports = Athlete;
