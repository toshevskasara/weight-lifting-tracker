// MyAreaChart.jsx
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const MyAreaChart = ({ data, title, isAnimationActive = true }) => (
  <div style={{ marginBottom: '2rem', width: '400px', height: '300px' }}>
    {title && <h5>{title}</h5>}
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="volume"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorVolume)"
          isAnimationActive={isAnimationActive}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default MyAreaChart;