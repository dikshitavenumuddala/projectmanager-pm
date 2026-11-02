const initialRuns = [
  {name:"Pipeline #104", build:"PASS", test:"PASS", deploy:"PASS", result:"SUCCESS", time:"10:42 AM"},
  {name:"Pipeline #103", build:"PASS", test:"PASS", deploy:"FAIL", result:"FAILED", time:"10:35 AM"},
  {name:"Pipeline #102", build:"PASS", test:"FAIL", deploy:"—", result:"FAILED", time:"10:27 AM"},
  {name:"Pipeline #101", build:"PASS", test:"PASS", deploy:"PASS", result:"SUCCESS", time:"10:18 AM"}
];

let runs = [...initialRuns];
let running = false;

const $ = id => document.getElementById(id);

function updateDashboard() {
  const total = runs.length;
  const successful = runs.filter(r => r.result === "SUCCESS").length;
  const failed = total - successful;
  const rate = total ? Math.round(successful / total * 100) : 0;

  $("total").textContent = total;
  $("successful").textContent = successful;
  $("failed").textContent = failed;
  $("rate").textContent = rate + "%";
  $("gaugeRate").textContent = rate + "%";
  $("rateText").textContent = total ? (rate >= 80 ? "Healthy pipeline performance" : "Needs improvement") : "No runs yet";
  $("gauge").style.background = `conic-gradient(#4f46e5 ${rate * 3.6}deg, #e4e7ec ${rate * 3.6}deg)`;

  $("history").innerHTML = runs.map(r => `
    <tr>
      <td><b>${r.name}</b></td>
      <td>${r.build === "PASS" ? "✅" : "❌"}</td>
      <td>${r.test === "PASS" ? "✅" : r.test === "FAIL" ? "❌" : "—"}</td>
      <td>${r.deploy === "PASS" ? "✅" : r.deploy === "FAIL" ? "❌" : "—"}</td>
      <td class="result ${r.result === "SUCCESS" ? "success-text" : "failed-text"}">${r.result}</td>
      <td>${r.time}</td>
    </tr>
  `).join("");
}

function resetStages() {
  ["build","test","deploy"].forEach(id => {
    $(id).className = "stage";
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPipeline() {
  if (running) return;
  running = true;
  $("runBtn").disabled = true;
  $("runBtn").textContent = "⏳ Running...";
  resetStages();
  $("pipelineStatus").className = "badge running";
  $("pipelineStatus").textContent = "RUNNING";
  $("message").textContent = "Pipeline started. Executing Build stage...";

  const buildOK = Math.random() > 0.12;
  const testOK = Math.random() > 0.20;
  const deployOK = Math.random() > 0.15;

  $("build").classList.add("running");
  await wait(900);
  $("build").classList.remove("running");
  $("build").classList.add(buildOK ? "pass" : "fail");

  if (!buildOK) {
    finishRun("FAIL", "—", "—", "Build failed. Pipeline stopped.");
    return;
  }

  $("message").textContent = "Build passed. Executing automated tests...";
  $("test").classList.add("running");
  await wait(900);
  $("test").classList.remove("running");
  $("test").classList.add(testOK ? "pass" : "fail");

  if (!testOK) {
    finishRun("PASS", "FAIL", "—", "Tests failed. Deployment skipped.");
    return;
  }

  $("message").textContent = "Tests passed. Deploying application...";
  $("deploy").classList.add("running");
  await wait(900);
  $("deploy").classList.remove("running");
  $("deploy").classList.add(deployOK ? "pass" : "fail");

  finishRun("PASS", "PASS", deployOK ? "PASS" : "FAIL",
            deployOK ? "Pipeline completed successfully." : "Deployment failed.");
}

function finishRun(build, test, deploy, message) {
  const success = build === "PASS" && test === "PASS" && deploy === "PASS";
  runs.unshift({
    name: "Pipeline #" + (105 + runs.length),
    build, test, deploy,
    result: success ? "SUCCESS" : "FAILED",
    time: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})
  });
  $("pipelineStatus").className = "badge " + (success ? "success" : "failed");
  $("pipelineStatus").textContent = success ? "SUCCESS" : "FAILED";
  $("message").textContent = message;
  updateDashboard();
  $("runBtn").disabled = false;
  $("runBtn").textContent = "▶ Run New Pipeline";
  running = false;
}

$("runBtn").addEventListener("click", runPipeline);
$("resetBtn").addEventListener("click", () => {
  if (running) return;
  runs = [...initialRuns];
  resetStages();
  $("pipelineStatus").className = "badge idle";
  $("pipelineStatus").textContent = "IDLE";
  $("message").textContent = "Demo data restored. Click “Run New Pipeline” to start.";
  updateDashboard();
});

updateDashboard();