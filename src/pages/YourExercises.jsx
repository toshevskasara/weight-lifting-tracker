import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import AreaChart from '../components/MyAreaChart.jsx'
import Loading  from '../pages/Loading.jsx'
import '../components/YourExercises.css'

const CATEGORIES = ['All', 'Upper Body', 'Lower Body', 'Core'];

function YourExercises() {
  const [logs, setLogs] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const FetchYourExercises = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("workout_logs")
      .select(`
        id,
        kg,
        reps,
        sets,
        created_at,
        exercises ( id, name, category )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching logs:", error.message);
      setLoading(false);
      return;
    }

    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (logs.length > 0) setEditingEntry(false);
  }, [logs]);

  useEffect(() => {
    FetchYourExercises();
  }, []);

  const handleEdit = (entry) => {
    setEditingEntry({
      id: entry.id,
      created_at: entry.created_at.slice(0, 10),
      kg: entry.kg,
      reps: entry.reps,
      sets: entry.sets,
    });

  };

  const closeModal = () => setEditingEntry(null);

  const handleModalChange = (field, value) => {
    setEditingEntry((prev) => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("workout_logs")
      .update({
        created_at: editingEntry.created_at,
        kg: Number(editingEntry.kg),
        reps: Number(editingEntry.reps),
        sets: (editingEntry.sets),
      })
      .eq("id", editingEntry.id);

    if (error) {
      console.error("Error updating log:", error.message);
      return;
    }

    setLogs((prev) =>
      prev.map((log) =>
        log.id === editingEntry.id
          ? { ...log, ...editingEntry, kg: Number(editingEntry.kg), reps: Number(editingEntry.reps), sets: Number(editingEntry.sets) }
          : log
      )
    );
    closeModal();
  };

    const handleDelete = async (entryId) => {
    const { error } = await supabase
      .from("workout_logs")
      .delete()
      .eq("id", entryId);

    if (error) {
      console.error("Error deleting log:", error.message);
      return;
    }

    setLogs((prev) => prev.filter((log) => log.id !== entryId));
  };

  const handleDeleteFromModal = async () => {
    await handleDelete(editingEntry.id);
    closeModal();
  };

  // for the table
  const grouped = logs.reduce((acc, log) => {
    const name = log.exercises?.name || "Unknown Exercise";
    if (!acc[name]) acc[name] = [];
    acc[name].push(log);
    return acc;
  }, {});

  //filter
  const filteredGrouped = Object.fromEntries(
    Object.entries(grouped).filter(([, entries]) => {
      if(activeCategory === 'All') return true;
      return entries[0]?.exercises?.category.toLowerCase() === activeCategory.toLowerCase();
    })
  );

  // for the chart
  const chartsData = Object.fromEntries(
    Object.entries(grouped).map(([exerciseName, entries]) => {
      const sorted = [...entries].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      const chartPoints = sorted.map((log) => ({
        label: new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short'}),
        volume: log.sets * log.reps * log.kg,
      }));
      return [exerciseName, chartPoints];
    })
  );

  if(loading){
    return <Loading/>;
  }

  return (
    <div>
      <h1>Your Exercises</h1>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "30px"
      }}>
      <div className="add-workout-wrap">
        <a className="btn btn-primary w-100" href="/#/workout" role="button">Add Workout</a>
      </div>
      </div>

      <ul className="nav nav-pills mb-4 category-bar justify-content-start">        {CATEGORIES.map((category) => (
          <li className="nav-item" key={category}>
            <button 
              className={`nav-link ${activeCategory == category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
              style={{ border: 'none', background: activeCategory === category ? undefined : 'transparent'}}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>

      {Object.entries(filteredGrouped).map(([exerciseName, entries]) => {
        const recentEntries = entries.slice(0, 5);

        return(
        <div key={exerciseName} className="mb-5">
            <h3>{exerciseName}</h3>
            <div className="row align-items-start">
              <div className="col-md-6">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight</th>
                      <th>Reps</th>
                      <th>Sets</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short'})}</td>
                        <td>{entry.kg}</td>
                        <td>{entry.reps}</td>
                        <td>{entry.sets}</td>
                        <td>
                          <button
                            className="btn btn-sm me-2 btn-edit"
                            onClick={() => handleEdit(entry)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

      <div className="col-md-6">
                <AreaChart data={chartsData[exerciseName]} />
              </div>
            </div>
          </div>
        );
      })}

      {editingEntry && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Log</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editingEntry.created_at}
                    onChange={(e) => handleModalChange('created_at', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingEntry.kg}
                    onChange={(e) => handleModalChange('kg', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Reps</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingEntry.reps}
                    onChange={(e) => handleModalChange('reps', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Sets</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingEntry.sets}
                    onChange={(e) => handleModalChange('sets', e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-danger" onClick={handleDeleteFromModal}>
                  Delete
                </button>
                <div>
                  <button className="btn btn-secondary me-2" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default YourExercises;