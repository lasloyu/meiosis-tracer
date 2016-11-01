import jsonFormat from "json-format";

const jsonFormatConfig = {
  type: "space",
  size: 2
};

const tracerContainerId = "tracerContainer";
const tracerId = "tracerSlider";
const tracerToggleId = "tracerToggle";
const tracerResetId = "tracerReset";
const tracerIndexId = "tracerIndex";
const tracerModelId = "tracerModel";
const tracerStateId = "tracerState";
const tracerProposalId = "tracerProposal";

const proposalView = renderRoot => ({model, proposal}, tracerModel) => {
  const tracer = document.getElementById(tracerId);
  tracer.setAttribute("max", String(tracerModel.tracerStates.length - 1));
  tracer.value = String(tracerModel.tracerIndex);

  const tracerIndex = document.getElementById(tracerIndexId);
  tracerIndex.innerHTML = String(tracerModel.tracerIndex);

  const tracerProposalEl = document.getElementById(tracerProposalId);
  tracerProposalEl.value = jsonFormat(proposal, jsonFormatConfig);

  const tracerModelEl = document.getElementById(tracerModelId);
  tracerModelEl.value = jsonFormat(model, jsonFormatConfig);

  const tracerStateEl = document.getElementById(tracerStateId);
  tracerStateEl.value = jsonFormat(renderRoot.state(model), jsonFormatConfig);
};

const onSliderChange = (renderRoot, tracerModel) => evt => {
  const index = parseInt(evt.target.value, 10);
  const snapshot = tracerModel.tracerStates[index];
  const state = renderRoot.state(snapshot.model);
  renderRoot(state);
  tracerModel.tracerIndex = index;
  proposalView(renderRoot)(snapshot, tracerModel);
};

const onModelChange = renderRoot => evt => {
  try {
    const model = JSON.parse(evt.target.value);
    const state = renderRoot.state(model);

    const tracerStateEl = document.getElementById(tracerStateId);
    tracerStateEl.value = jsonFormat(renderRoot.state(model), jsonFormatConfig);

    renderRoot(state);
  }
  catch (err) {
    // ignore invalid JSON
  }
};

const onToggle = tracerContainer => evt => {
  const button = evt.target;

  if (tracerContainer.style.display === "none") {
    tracerContainer.style.display = "block";
    button.innerHTML = "Hide";
  }
  else {
    tracerContainer.style.display = "none";
    button.innerHTML = "Show";
  }
};

const onReset = (renderRoot, tracerModel) => () => {
  reset(renderRoot, tracerModel);
};

const reset = (renderRoot, tracerModel) => {
  tracerModel.tracerStates.length = 0;
  tracerModel.tracerIndex = 0;
  proposalView(renderRoot)({model: renderRoot.initialModel, proposal: {}}, tracerModel);
};

const initialView = (selector, renderRoot, tracerModel, horizontal) => {
  const target = document.querySelector(selector);

  if (target) {
    const divStyle = horizontal ? " style='float: left'" : "";

    const viewHtml = "<div style='text-align: right'><button id='" + tracerToggleId + "'>Hide</button></div>" +
      "<div id='" + tracerContainerId + "'>" +
      "<div style='text-align: right'><button id='" + tracerResetId + "'>Reset</button></div>" +
      "<input id='" + tracerId + "' type='range' min='0' max='" +
      String(tracerModel.tracerStates.length - 1) +
      "' value='" + String(tracerModel.tracerIndex) + "' style='width: 100%'/>" +
      "<div id='" + tracerIndexId + "'>" + String(tracerModel.tracerIndex) + "</div>" +
      "<div" + divStyle + "><div>Proposal:</div>" +
      "<textarea id='" + tracerProposalId + "' rows='5' cols='40'></textarea></div>" +
      "<div" + divStyle + "><div>Model: (you can type into this box)</div>" +
      "<textarea id='" + tracerModelId + "' rows='5' cols='40'></textarea></div></div>" +
      "<div" + divStyle + "><div>State:</div>" +
      "<textarea id='" + tracerStateId + "' rows='5' cols='40'></textarea></div></div>";

    target.innerHTML = viewHtml;

    const tracerContainer = document.getElementById(tracerContainerId);

    document.getElementById(tracerId).addEventListener("input", onSliderChange(renderRoot, tracerModel));
    document.getElementById(tracerModelId).addEventListener("keyup", onModelChange(renderRoot));
    document.getElementById(tracerToggleId).addEventListener("click", onToggle(tracerContainer));
    document.getElementById(tracerResetId).addEventListener("click", onReset(renderRoot, tracerModel));
  }
};

export { initialView, proposalView, reset };
