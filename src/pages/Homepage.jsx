import { useState, useEffect} from 'react';
import { supabase } from '../supabaseClient';
import AreaChart from '../components/MyAreaChart.jsx'
import Loading from './Loading.jsx';
import '../components/Homepage.css'

function Homepage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      setLoading(true);

      const { data : { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user: ", userError.message);
        return;
      }

      if(!user) {
        console.log("No logged in user");
        return;
      }

      const now = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      const previousPeriod = new Date();
      previousPeriod.setDate(now.getDate() - 14);

      const { data, error } = await supabase
        .from("workout_logs")
        .select(`
          id,
          kg,
          reps,
          sets,
          created_at,
          exercises (id, name, category)
          `)
        .eq("user_id", user.id)
        .gte("created_at", previousPeriod.toISOString())
        .order("created_at", { ascending: false});
      if (error) {
        console.error("Error fetching: ", error.message);
        return;
      }

      const currentWeek = data.filter(
        (log) =>
            new Date(log.created_at) >= lastWeek
      );

      const previousWeek = data.filter(
        (log) => 
          new Date(log.created_at) >= previousPeriod &&
        new Date(log.created_at) < lastWeek
      );

      const getBestVolume = (logs) => {
        const best = {};

        logs.forEach((log) => {
          const exerciseName = log.exercises?.name;


          if (!exerciseName) return;

          const volume = log.kg * log.reps * log.sets;

          if(!best[exerciseName] || volume > best[exerciseName]){
            best[exerciseName] = volume;
          }
        });

        return best;
      };

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
      }

      const getGraphData = (logs) => {
        const byExercise = {};

        logs.forEach((log) => {
          const exerciseName = log.exercises?.name;

          if (!exerciseName) return;

          if (!byExercise[exerciseName]) byExercise[exerciseName] = [];

          byExercise[exerciseName].push({
            label: new Date(log.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            }),
            volume: log.kg * log.reps * log.sets,
          });
        });

        return byExercise;
      };

      const currentBest = getBestVolume(currentWeek);
      const previousBest = getBestVolume(previousWeek);
      const highestWeightByExercise = getHighestWeight(currentWeek);
      const graphDataByExercise = getGraphData(data);

      const improved = Object.entries(currentBest)
        .map(([exerciseName, currentVolume]) => {
          const previousVolume = previousBest[exerciseName] || 0;

          if( previousVolume === 0){
            return{
              exerciseName,
              currentVolume,
              previousVolume,
              improvement: null,
              highestWeight: highestWeightByExercise[exerciseName] || 0,
              graphData: graphDataByExercise[exerciseName] || [],
            };
          }

          const improvement = ((currentVolume - previousVolume) / previousVolume) * 100;

          return{
            exerciseName,
            currentVolume,
            previousVolume,
            improvement,
            highestWeight: highestWeightByExercise[exerciseName] || 0,
            graphData: graphDataByExercise[exerciseName] || [],
          };
        })
        .filter((exercise) => {
          //only the exercises that actually improved
          return(
            exercise.previousVolume > 0 && exercise.improvement > 0

          );
        })
        .sort((a, b) => b.improvement - a.improvement)
        .slice(0, 3);

        setAchievements(improved);
    }
    finally{
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAchievements();
  }, []);

  return (
    <div className="container">
      <p className='track'>Track your weight lifting exercises and progress.</p>
      <div className="add-workout-wrap">
        <a className="btn btn-primary w-100" href="/#/workout" role="button">Add Workout</a>
      </div>
      <h3 className='recent'>Recent Achievements</h3>

      {loading ? (
        <Loading />
      ) : achievements.length === 0 ? (
        <p> No improvements yet. Keep working out and your achievements will appear here! </p>
      ) : (
        <div className="row">
          {achievements.map((achievement, index) => (
            <div className='col-12 mb-3' key={achievement.exerciseName}>
              <div className='card'>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <h5 className="card-title">
                        #{index + 1} {achievement.exerciseName}
                      </h5>
 
                      <p className="card-text"> Improved by{" "} <strong> {achievement.improvement.toFixed(1)}% </strong> </p>
                      <p className="card-text"> Highest weight:{" "} <strong> {achievement.highestWeight.toLocaleString()} kg </strong> </p>
                    </div>
                    <div className="col-md-8">
                      <AreaChart data={achievement.graphData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}

export default Homepage;