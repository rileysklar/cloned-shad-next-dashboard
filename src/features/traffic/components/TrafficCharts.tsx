'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { useTrafficMetadata } from '../utils';
import { TrafficIncident, TrafficIncidentFilters } from '@/types/traffic';
import { TrafficChartsSkeleton } from './traffic-charts-skeleton';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useThemeConfig } from '@/components/active-theme';

interface TrafficChartsProps {
  incidents: TrafficIncident[];
  filters?: TrafficIncidentFilters;
}

// Colors and config are now dynamic based on theme

export function TrafficCharts({ incidents, filters }: TrafficChartsProps) {
  const { stats, loading } = useTrafficMetadata();
  const [activeChart, setActiveChart] = React.useState<
    'active' | 'archived' | 'pending'
  >('active');
  const { activeTheme } = useThemeConfig();

  // Dynamic colors based on current theme
  const chartColors = React.useMemo(() => {
    switch (activeTheme) {
      case 'blue':
        return [
          'oklch(0.6 0.2 240)', // Blue theme - chart-1
          'oklch(0.7 0.15 200)', // Blue theme - chart-2
          'oklch(0.5 0.25 280)', // Blue theme - chart-3
          'oklch(0.8 0.18 220)', // Blue theme - chart-4
          'oklch(0.65 0.22 260)', // Blue theme - chart-5
          'oklch(0.6 0.2 240)' // Blue theme - primary
        ];
      case 'green':
        return [
          'oklch(0.6 0.2 140)', // Green theme - chart-1
          'oklch(0.7 0.15 160)', // Green theme - chart-2
          'oklch(0.5 0.25 120)', // Green theme - chart-3
          'oklch(0.8 0.18 180)', // Green theme - chart-4
          'oklch(0.65 0.22 100)', // Green theme - chart-5
          'oklch(0.6 0.2 140)' // Green theme - primary
        ];
      case 'amber':
        return [
          'oklch(0.7 0.2 60)', // Amber theme - chart-1
          'oklch(0.8 0.15 80)', // Amber theme - chart-2
          'oklch(0.6 0.25 40)', // Amber theme - chart-3
          'oklch(0.9 0.18 100)', // Amber theme - chart-4
          'oklch(0.75 0.22 20)', // Amber theme - chart-5
          'oklch(0.7 0.2 60)' // Amber theme - primary
        ];
      case 'default-scaled':
        return [
          'oklch(0.5 0.15 240)', // Scaled theme - chart-1
          'oklch(0.6 0.12 200)', // Scaled theme - chart-2
          'oklch(0.4 0.18 280)', // Scaled theme - chart-3
          'oklch(0.7 0.14 220)', // Scaled theme - chart-4
          'oklch(0.55 0.16 260)', // Scaled theme - chart-5
          'oklch(0.5 0.15 240)' // Scaled theme - primary
        ];
      case 'blue-scaled':
        return [
          'oklch(0.5 0.15 240)', // Blue scaled - chart-1
          'oklch(0.6 0.12 200)', // Blue scaled - chart-2
          'oklch(0.4 0.18 280)', // Blue scaled - chart-3
          'oklch(0.7 0.14 220)', // Blue scaled - chart-4
          'oklch(0.55 0.16 260)', // Blue scaled - chart-5
          'oklch(0.5 0.15 240)' // Blue scaled - primary
        ];
      case 'mono-scaled':
        return [
          'oklch(0.6 0 0)', // Mono theme - chart-1
          'oklch(0.7 0 0)', // Mono theme - chart-2
          'oklch(0.5 0 0)', // Mono theme - chart-3
          'oklch(0.8 0 0)', // Mono theme - chart-4
          'oklch(0.65 0 0)', // Mono theme - chart-5
          'oklch(0.6 0 0)' // Mono theme - primary
        ];
      default: // 'default' theme
        return [
          'oklch(0.646 0.222 41.116)', // Default theme - chart-1
          'oklch(0.6 0.118 184.704)', // Default theme - chart-2
          'oklch(0.398 0.07 227.392)', // Default theme - chart-3
          'oklch(0.828 0.189 84.429)', // Default theme - chart-4
          'oklch(0.769 0.188 70.08)', // Default theme - chart-5
          'oklch(0.205 0 0)' // Default theme - primary
        ];
    }
  }, [activeTheme]);

  // Dynamic chart config based on current theme
  const dynamicChartConfig = React.useMemo(() => {
    const getThemeColor = (baseColor: string, theme: string) => {
      switch (theme) {
        case 'blue':
          return 'oklch(0.6 0.2 240)';
        case 'green':
          return 'oklch(0.6 0.2 140)';
        case 'amber':
          return 'oklch(0.7 0.2 60)';
        case 'default-scaled':
        case 'blue-scaled':
          return 'oklch(0.5 0.15 240)';
        case 'mono-scaled':
          return 'oklch(0.6 0 0)';
        default:
          return baseColor;
      }
    };

    return {
      views: {
        label: 'Incidents'
      },
      active: {
        label: 'Active',
        color: getThemeColor('oklch(0.577 0.245 27.325)', activeTheme)
      },
      archived: {
        label: 'Archived',
        color: getThemeColor('oklch(0.556 0 0)', activeTheme)
      },
      pending: {
        label: 'Pending',
        color: getThemeColor('oklch(0.8 0.2 60)', activeTheme)
      }
    };
  }, [activeTheme]);

  // Don't early return - render skeleton within the same component structure

  // Prepare data for status pie chart
  const statusData = stats?.byStatus
    ? Object.entries(stats.byStatus).map(([status, count]) => ({
        name: status,
        value: count
      }))
    : [];

  // Prepare data for agency bar chart
  const agencyData = stats?.byAgency
    ? Object.entries(stats.byAgency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Top 10 agencies
        .map(([agency, count]) => ({
          name: agency.length > 20 ? agency.substring(0, 20) + '...' : agency,
          fullName: agency,
          count
        }))
    : [];

  // Prepare data for issue type bar chart
  const issueTypeData = stats?.byIssueType
    ? Object.entries(stats.byIssueType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8) // Top 8 issue types
        .map(([issue, count]) => ({
          name: issue.length > 25 ? issue.substring(0, 25) + '...' : issue,
          fullName: issue,
          count
        }))
    : [];

  // Debug logging for issue type data
  React.useEffect(() => {
    console.log('Issue Type Data:', issueTypeData);
    console.log('Stats byIssueType:', stats?.byIssueType);
  }, [issueTypeData, stats?.byIssueType]);

  // Prepare timeline data (last 7 days)
  const timelineData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const incidentsByDate = incidents.reduce(
      (acc, incident) => {
        const date = incident.published_date.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      incidents: incidentsByDate[date] || 0
    }));
  }, [incidents]);

  // Calculate additional stats
  const recentIncidents = incidents.filter((incident) => {
    const incidentDate = new Date(incident.published_date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return incidentDate >= yesterday;
  }).length;

  const activeIncidents = incidents.filter(
    (incident) => incident.traffic_report_status.toLowerCase() === 'active'
  ).length;

  // Process incidents data for the interactive chart
  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map((date) => {
      const dayIncidents = incidents.filter(
        (incident) => incident.published_date.split('T')[0] === date
      );

      return {
        date,
        active: dayIncidents.filter(
          (i) => i.traffic_report_status.toLowerCase() === 'active'
        ).length,
        archived: dayIncidents.filter(
          (i) => i.traffic_report_status.toLowerCase() === 'archived'
        ).length,
        pending: dayIncidents.filter(
          (i) => i.traffic_report_status.toLowerCase() === 'pending'
        ).length
      };
    });
  }, [incidents]);

  const total = React.useMemo(
    () => ({
      active: chartData.reduce((acc, curr) => acc + curr.active, 0),
      archived: chartData.reduce((acc, curr) => acc + curr.archived, 0),
      pending: chartData.reduce((acc, curr) => acc + curr.pending, 0)
    }),
    [chartData]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background border-border rounded-lg border p-3 shadow-lg'>
          <p className='text-foreground font-medium'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <TrafficChartsSkeleton />;
  }

  return (
    <div className='space-y-6'>
      {/* Summary Stats */}
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4'>
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <CardDescription>Total Incidents</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats?.total || 0}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm'>
            All time incidents
          </CardContent>
        </Card>
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <CardDescription>Active Incidents</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {activeIncidents}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm'>
            Currently active
          </CardContent>
        </Card>
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <CardDescription>Last 24 Hours</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {recentIncidents}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm'>
            New incidents
          </CardContent>
        </Card>
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <CardDescription>Agencies</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {stats?.byAgency ? Object.keys(stats.byAgency).length : 0}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm'>
            Responding agencies
          </CardContent>
        </Card>
      </div>

      {/* Interactive Traffic Chart */}
      <Card className='@container/card !pt-3' data-slot='card'>
        <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
          <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
            <CardTitle>Traffic Incidents - Interactive</CardTitle>
            <CardDescription>
              <span className='hidden @[540px]/card:block'>
                Daily incident counts for the last 7 days
              </span>
              <span className='@[540px]/card:hidden'>Last 7 days</span>
            </CardDescription>
          </div>
          <div className='flex'>
            {['active', 'archived', 'pending'].map((key) => {
              const chart = key as 'active' | 'archived' | 'pending';
              if (!chart || total[key as keyof typeof total] === 0) return null;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                  onClick={() => setActiveChart(chart)}
                >
                  <span className='text-muted-foreground text-xs'>
                    {dynamicChartConfig[chart].label}
                  </span>
                  <span className='text-lg leading-none font-bold sm:text-3xl'>
                    {total[key as keyof typeof total]?.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <ChartContainer
            config={dynamicChartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12
              }}
            >
              <defs>
                <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor={chartColors[5]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='100%'
                    stopColor={chartColors[5]}
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                }}
              />
              <ChartTooltip
                cursor={{ fill: chartColors[5], opacity: 0.1 }}
                content={
                  <ChartTooltipContent
                    className='w-[150px]'
                    nameKey='incidents'
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    }}
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill='url(#fillBar)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Status Distribution - Pie Chart */}
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <CardTitle>Incidents by Status</CardTitle>
            <CardDescription>
              Distribution of traffic incident statuses
              {filters?.date_range?.start && (
                <span className='text-muted-foreground mt-1 block text-xs'>
                  From {filters.date_range.start.toLocaleDateString()}
                  {filters.date_range.end &&
                    ` to ${filters.date_range.end.toLocaleDateString()}`}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill={chartColors[0]}
                    dataKey='value'
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='text-muted-foreground flex h-[300px] items-center justify-center'>
                <div className='text-center'>
                  <p>No status data available</p>
                  <p className='text-sm'>
                    Check if incidents have status information
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline Chart - Area Chart */}
        <Card className='@container/card' data-slot='card'>
          <CardHeader>
            <CardTitle>Incidents Over Time</CardTitle>
            <CardDescription>
              Daily incident count for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='incidents'
                    stroke={chartColors[0]}
                    fill={chartColors[0]}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='text-muted-foreground flex h-[300px] items-center justify-center'>
                <div className='text-center'>
                  <p>No timeline data available</p>
                  <p className='text-sm'>
                    Check if incidents have date information
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
