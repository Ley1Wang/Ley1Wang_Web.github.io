import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Layout, Menu, Card, Button, Table, Space, Statistic, Row, Col, message } from "antd";
import ReactECharts from "echarts-for-react";
import "antd/dist/reset.css";

const API = "http://127.0.0.1:5000";
const { Header, Sider, Content } = Layout;

const charts = {
  rating: { name: "Rating", url: "/api/rating", type: "bar" },
  year: { name: "Year", url: "/api/year", type: "line" },
  category: { name: "Category", url: "/api/category", type: "pie" },
  task: { name: "Crawler Task" },
};

function formatDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  const [key, setKey] = useState("task");
  const [data, setData] = useState(null);
  const [runDate, setRunDate] = useState(formatDate());
  const [runs, setRuns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [overview, setOverview] = useState({ today: 0, total: 0, unique: 0, latest: null });
  const chart = charts[key];

  useEffect(() => {
    if (key === "task") {
      refreshTask(runDate);
      return;
    }

    fetch(API + chart.url)
      .then((res) => res.json())
      .then(setData);
  }, [key]);

  function refreshTask(date) {
    loadRuns(date);
    loadSummary();
    loadOverview();
  }

  function loadRuns(date) {
    fetch(API + "/api/runs?date=" + date)
      .then((res) => res.json())
      .then((res) => setRuns(res.runs));
  }

  function loadSummary() {
    fetch(API + "/api/run-summary")
      .then((res) => res.json())
      .then(setSummary);
  }

  function loadOverview() {
    fetch(API + "/api/task-overview")
      .then((res) => res.json())
      .then(setOverview);
  }

  function selectDate(date) {
    setRunDate(date);
    loadRuns(date);
  }

  function runCrawler() {
    fetch(API + "/api/run", { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        message.success(res.message + ": " + res.new + " new, " + res.duplicate + " duplicate");
        const now = formatDate();
        setRunDate(now);
        refreshTask(now);
      });
  }

  function chartOption() {
    if (!data) return { title: { text: "Loading" } };

    if (key === "category") {
      return { tooltip: {}, series: [{ type: "pie", radius: "65%", data: data.data }] };
    }

    return {
      tooltip: {},
      xAxis: { type: "category", data: data.x },
      yAxis: { type: "value" },
      series: [{ type: chart.type, data: data.y, smooth: true }],
    };
  }

  function taskPage() {
    const latest = overview.latest;
    const summaryOption = {
      tooltip: {},
      xAxis: { type: "category", data: summary ? summary.x : [] },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: summary ? summary.y : [] }],
    };

    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col span={6}><Card><Statistic title="Today Runs" value={overview.today} /></Card></Col>
          <Col span={6}><Card><Statistic title="Total Runs" value={overview.total} /></Card></Col>
          <Col span={6}><Card><Statistic title="Unique Movies" value={overview.unique} /></Card></Col>
          <Col span={6}><Card><Statistic title="Latest" value={latest ? latest.date + " " + latest.time : "No run"} /></Card></Col>
        </Row>

        <Card title="Crawler Task History">
          <Space style={{ marginBottom: 16 }} wrap>
            <Button type="primary" onClick={runCrawler}>Run Crawler</Button>
            <Button onClick={() => selectDate(formatDate())}>Today</Button>
            <Button onClick={() => selectDate(formatDate(-1))}>Yesterday</Button>
            <Button onClick={() => selectDate(formatDate(-2))}>Two Days Ago</Button>
            <input type="date" value={runDate} onChange={(e) => selectDate(e.target.value)} />
          </Space>
          <Table
            rowKey="id"
            pagination={false}
            dataSource={runs}
            columns={[
              { title: "ID", dataIndex: "id" },
              { title: "Task", dataIndex: "task" },
              { title: "Time", dataIndex: "time" },
              { title: "Status", dataIndex: "status" },
              { title: "Items", dataIndex: "total" },
              { title: "New", dataIndex: "new" },
              { title: "Duplicate", dataIndex: "duplicate" },
            ]}
          />
        </Card>

        <Card title="Runs in Last 7 Days">
          <ReactECharts option={summaryOption} style={{ height: 320 }} />
        </Card>
      </Space>
    );
  }

  return (
    <Layout className="page">
      <Header className="topbar">Week 5 Movie Crawler Dashboard</Header>
      <Layout>
        <Sider className="sidebar" width={220}>
          <Menu
            mode="inline"
            selectedKeys={[key]}
            onClick={(item) => setKey(item.key)}
            items={Object.keys(charts).map((id) => ({ key: id, label: charts[id].name }))}
          />
        </Sider>
        <Content className="content">
          {key === "task" ? taskPage() : (
            <Card title={chart.name}>
              <ReactECharts option={chartOption()} style={{ height: 420 }} />
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

createRoot(document.getElementById("root")).render(<App />);