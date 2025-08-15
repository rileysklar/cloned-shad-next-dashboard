'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { TrafficIncident } from '@/types/traffic';
import { InteractiveTrafficChartSkeleton } from './interactive-traffic-chart-skeleton';

interface InteractiveTrafficChartProps {
  incidents: TrafficIncident[];
  loading?: boolean;
}

export const description = 'An interactive traffic incidents bar chart';

const chartConfig = {
  views: {
    label: 'Incidents'
  },
  active: {
    label: 'Active',
    color: 'var(--destructive)'
  },
  archived: {
    label: 'Archived',
    color: 'var(--muted)'
  },
  pending: {
    label: 'Pending',
    color: 'var(--warning)'
  }
} satisfies ChartConfig;

export function InteractiveTrafficChart({
  incidents,
  loading
}: InteractiveTrafficChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('active');

  // Process incidents data for the chart
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

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return <InteractiveTrafficChartSkeleton />;
  }

  return (
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
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
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
          config={chartConfig}
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
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
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
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
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
  );
}
