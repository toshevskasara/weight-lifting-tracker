import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import '../components/Workout.css'

function Workout() {
    const [exercises, setExercises] = useState([]);
    const [bodyPart, setBodyPart] = useState('');
    const [selectedExercise, setSelectedExercise] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');
    const [showSuccess, setShowSuccess] = useState('');

    const FetchExercises = async () => {
        const { error, data } = await supabase
        .from("exercises")
        .select("id, name, category");

        if (error) {
            console.error("Error fetching exercises:", error.message);
            return;
        }

        setExercises(data);
    };

    
    useEffect(() => {
        FetchExercises();
    }, []);

    useEffect(() => {
        if(!showSuccess) return;
        const timer = setTimeout(() => setShowSuccess(false), 3000);
        return () => clearTimeout(timer);
    }, [showSuccess]);

    const filteredExercises = exercises.filter(ex => ex.category === bodyPart);

    const handleBodyPartChange = (e) => {
        setBodyPart(e.target.value);
        setSelectedExercise('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedExercise || !weight || !reps || !sets) {
            alert("Please fill in all fields.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error("User not logged in.");
            return;
        }

        const { error } = await supabase
            .from("workout_logs")
            .insert({
                user_id: user.id,
                exercise_id: selectedExercise,
                kg: weight,
                reps: reps,
                sets: sets,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error("Error inserting workout log:", error.message);
            return;
        }

        setBodyPart('');
        setSelectedExercise('');
        setWeight('');
        setReps('');
        setSets('');
        setShowSuccess(true);
    };


    return(
        <div className='workout-page'>
            <form onSubmit={handleSubmit}>
            <h1>Choose Your Exercises</h1>

            <select 
                className="form-select"
                value={bodyPart}
                onChange={handleBodyPartChange}
            >
                <option value="">Choose body part</option>
                <option value="upper body">Upper Body</option>
                <option value="lower body">Lower Body</option>
                <option value="core">Core</option>
            </select>

            <select 
                className="form-select"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                disabled={!bodyPart}
            >
                <option value="">Choose exercise</option>
                {filteredExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
            </select>

            <p className='form-label'>Weight (kg)</p>
            <input className="form-control" type="text" placeholder="Kg" 
                value={weight} onChange={(e) => setWeight(e.target.value)} aria-label="default input example"/>
            
            <p className='form-label'>Reps</p>
            <input className="form-control" type="text" placeholder="Reps" 
                value={reps} onChange={(e) => setReps(e.target.value)} aria-label="default input example"/>

            <p className='form-label'>Sets</p>
            <input className="form-control" type="text" placeholder="Sets" 
                value={sets} onChange={(e) => setSets(e.target.value)} aria-label="default input example"/>


            <input className="btn btn-primary" type="submit" value="Submit"/>
            
        </form>

        {showSuccess && (
            <div className="success-toast" role="status">
                Workout logged successfully
            </div>
        )}
        
        </div>

    )
}

export default Workout;