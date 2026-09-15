import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import Loading  from '../pages/Loading.jsx'
import '../components/PersonalBest.css'


function PersonalBest(){
    const [logs, setLogs] = useState([]);
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
    FetchYourExercises();
  }, []);

  const getHighestWeight = (logs) => {
    const highest = {};

    logs.forEach((log) => {
        const exerciseName = log.exercises?.name;

        if(!exerciseName) return;

        if(!highest[exerciseName] || log.kg > highest[exerciseName]){
            highest[exerciseName] = log.kg;
          }
        });

        return highest;
    };

    const getLatestDate = (logs) => {
    const latest = {};
 
    logs.forEach((log) => {
      const exerciseName = log.exercises?.name;
 
      if (!exerciseName) return;
 
      if (!latest[exerciseName]) {
        latest[exerciseName] = log.created_at;
      }
    });
 
    return latest;
  };

    const getReps = (logs) => {
        const maxireps = {};

        logs.forEach((log) =>{
            const exerciseName = log.exercises?.name;

            if(!exerciseName) return;
            
            if(!maxireps[exerciseName]){
                maxireps[exerciseName] = log.reps;
            }
        });

        return maxireps;
    }

    const highestWeightByExercise = getHighestWeight(logs);
    const latestDateByExercise = getLatestDate(logs);
    const repsByExercise = getReps(logs);
    
    

    const personalBests = Object.keys(highestWeightByExercise)
    .map((exerciseName) => ({
      exerciseName,
      maxWeight: highestWeightByExercise[exerciseName],
      latestDate: latestDateByExercise[exerciseName],
      maxReps: repsByExercise[exerciseName],
    }))
    .sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));

    return(
    <div className="container">
      <h1>Personal Best</h1>
      <p className='disclaimer'>The formula used to predict a personal best one-rep max is the Epley Method.</p>
 
      {loading ? (
        <Loading />
      ) : personalBests.length === 0 ? (
        <p>No exercises logged yet. Once you add a workout, your personal bests will show up here!</p>
      ) : (
        <div className="row">
          {personalBests.map((pb) => (
            <div className="col-12 mb-3" key={pb.exerciseName}>
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <h5 className="card-title mb-0">{pb.exerciseName}</h5>
                    </div>
                    <div className="col-md-4">
                      <p className="card-text mb-0">
                        Max weight: <strong>{pb.maxWeight.toLocaleString()} kg</strong>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="card-text mb-0">
                        Last done:{" "}
                        <strong>
                          {new Date(pb.latestDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            <div className='predicted-container'>
                <p className="predicted">
                    Predicted PB: <strong>{(pb.maxWeight * (1 + pb.maxReps / 30)).toLocaleString()} kg</strong>
                </p>
            </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );

    
};

export default PersonalBest;