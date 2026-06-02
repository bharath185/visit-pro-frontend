import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { EChartsOption } from 'echarts';

const API = 'http://192.168.2.45:8081/api';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html'
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  loading = true;
  headerMetrics: any = {};
  myInvites: any[] = [];

  doughnutOption: EChartsOption = {};
  barOption: EChartsOption = {};
  trendOption: EChartsOption = {};

  constructor(private http: HttpClient, public auth: AuthService) {
    this.user = auth.currentUser;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    if (!this.user?.EmpId) { this.loading = false; return; }
    this.loading = true;
    this.http.get<any>(API + '/visitor/user-dashboard/' + this.user.EmpId).subscribe({
      next: m => { this.headerMetrics = m; this.buildCharts(); },
      error: () => {}
    });
    this.http.post<any[]>(API + '/visitor/by-employee', { EmpId: this.user.EmpId }).subscribe({
      next: v => { this.myInvites = Array.isArray(v) ? v : []; this.buildCharts(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  buildCharts(): void {
    const inv = this.headerMetrics.TotalVisitors || 0;
    const acc = this.headerMetrics.TotalAccepted || 0;
    const cin = this.headerMetrics.TotalCheckedIn || 0;
    const cout = this.headerMetrics.TotalCheckedOut || 0;
    this.doughnutOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
      series: [{ type: 'pie', radius: ['45%', '72%'], center: ['50%', '42%'], label: { show: false },
        data: [
          { value: inv, name: 'Invited', itemStyle: { color: '#1890ff' } },
          { value: acc, name: 'Accepted', itemStyle: { color: '#52c41a' } },
          { value: cin, name: 'Checked In', itemStyle: { color: '#fa8c16' } },
          { value: cout, name: 'Checked Out', itemStyle: { color: '#13c2c2' } }
        ] }]
    };
    this.barOption = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 50, right: 10, top: 10, bottom: 24 },
      xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      yAxis: { type: 'category', data: ['Invited', 'Accepted', 'Checked In', 'Checked Out'], axisLabel: { fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: [inv, acc, cin, cout], barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0], color: (p: any) => ['#1890ff', '#52c41a', '#fa8c16', '#13c2c2'][p.dataIndex] },
        label: { show: true, position: 'right', fontSize: 10, fontWeight: 600 } }]
    };
    const map = new Map<string, { visitors: number; checkins: number; checkouts: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      map.set(key, { visitors: 0, checkins: 0, checkouts: 0 });
    }
    for (const v of this.myInvites) {
      if (!v.Date) continue;
      const key = new Date(v.Date).toISOString().substring(0, 10);
      const entry = map.get(key);
      if (entry) { entry.visitors++; if (v.CheckIn) entry.checkins++; if (v.CheckOut) entry.checkouts++; }
    }
    const trendData = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([d, v]) => ({ date: d, ...v }));
    this.trendOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Visitors', 'Check-Ins', 'Check-Outs'], bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
      grid: { left: 40, right: 10, top: 10, bottom: 36 },
      xAxis: { type: 'category', data: trendData.map(d => d.date.substring(5)), axisLabel: { fontSize: 10 }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
      series: [
        { name: 'Visitors', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: trendData.map(d => d.visitors), lineStyle: { color: '#1890ff', width: 2 }, itemStyle: { color: '#1890ff' }, areaStyle: { color: 'rgba(24,144,255,0.08)' } },
        { name: 'Check-Ins', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: trendData.map(d => d.checkins), lineStyle: { color: '#52c41a', width: 2 }, itemStyle: { color: '#52c41a' }, areaStyle: { color: 'rgba(82,196,26,0.08)' } },
        { name: 'Check-Outs', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: trendData.map(d => d.checkouts), lineStyle: { color: '#fa8c16', width: 2 }, itemStyle: { color: '#fa8c16' }, areaStyle: { color: 'rgba(250,140,22,0.08)' } }
      ]
    };
  }

  getStatusColor(s: string): string {
    const m: any = { 'Invited': 'blue', 'Invite Accepted': 'green', 'Checked In': 'orange', 'Checked Out': 'cyan', 'Cancelled': 'red', 'Expired': 'red', 'Pending Approval': 'purple', 'Approved': 'lime' };
    return m[s] || 'default';
  }
}
