function getJobDetails() {
  const title = document.querySelector(
    'div[class="content span-md-8 span-lg-9"] h3[class="mb-6x h5"]'
  )?.innerText;
  const description = document.querySelector(
    'div[class="content span-md-8 span-lg-9"] div div[class="description text-body-sm"'
  )?.innerText;

  const hourlyRate = document.querySelector("#step-rate")?.value;
  const recievedHourlyRate =
    document.querySelector("#receive-step-rate")?.value;

  const milestoneModeInputs = document.querySelectorAll(
    'input[name="milestoneMode"]'
  );

  let milestoneMode = "";
  milestoneModeInputs.forEach((radio) => {
    if (radio.checked) {
      milestoneMode = radio.value;
    }
  });

  const milestoneDetailsDivs = document.querySelectorAll(
    'div[data-test="milestones"] div[data-test="milestone"]'
  );

  let milestoneDetails = [];

  if (milestoneDetailsDivs.length > 0) {
    milestoneDetails = Array.from(milestoneDetailsDivs)?.map((div) => {
      // Description (from the input with the class "milestone-description")
      const description =
        div.querySelector('[data-test="milestone-description"]')?.value ||
        "No description";

      // Due Date (from the input inside the "milestone-due-date" class)
      const dueDate = div.querySelector(
        '[data-test="milestone-due-date"] .air3-input'
      )?.value;

      // Amount (from the input inside the "milestone-amount" class)
      const amount =
        div.querySelector('[data-test="milestone-amount"] .air3-input')
          ?.value || 0;
      return {
        description,
        dueDate,
        amount,
      };
    });
  }

  const projectRate = document.querySelector("#charged-amount-id")?.value;
  const recievedProjectRate =
    document.querySelector("#earned-amount-id")?.value;

  let projectDuration = "";

  const label = document.querySelector("label#duration-label");

  if (label) {
    projectDuration = label
      .closest(".form-group")
      .querySelector(".air3-dropdown-toggle-label")
      ?.innerText.trim();
  }

  const proposal = document.querySelector(
    "textarea[aria-labelledby='cover_letter_label']"
  )?.value;

  const connectsDivs = document.querySelectorAll(
    'div[class="air3-grid-container mt-2x text-body"] div'
  );

  let requiredConnects = 0;
  let boostedConnects = 0;
  if (connectsDivs.length > 0) {
    connectsDivs?.forEach((div, i) => {
      if (div.innerText.includes("Bid to boost:")) {
        const boostedConnectsText = connectsDivs[i + 1].innerText.trim();
        boostedConnects = boostedConnectsText
          ? parseInt(boostedConnectsText.match(/\d+/)[0])
          : 0;
      }

      if (div.innerText.includes("Required for proposal:")) {
        const requiredConnectsText = connectsDivs[i + 1].innerText.trim();
        requiredConnects = requiredConnectsText
          ? parseInt(requiredConnectsText.match(/\d+/)[0])
          : 0;
      }
    });
  }

  const bidStats = document.querySelector(
    "[data-test='number-of-proposals']"
  )?.innerText;

  return {
    title,
    description,
    hourlyRate,
    recievedHourlyRate,
    milestoneMode,
    milestoneDetails,
    projectRate,
    projectDuration,
    recievedProjectRate,
    proposal,
    boostedConnects,
    requiredConnects,
    connectsUsed: requiredConnects + parseInt(boostedConnects),
    bidStats,
    url: window.location.href,
  };
}

function addButton() {
  if (document.getElementById("addToCrmBtn")) return;

  const submitSection = document.querySelector(
    'div[class="fe-apply-footer-controls"]'
  );

  if (!submitSection) return;

  const btn = document.createElement("button");
  btn.id = "addToCrmBtn";
  btn.innerText = "Add to CRM";
  btn.style = `
    margin-top: 10px;
    padding: 10px 16px;
    background-color: #108A00;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  `;

  btn.onclick = async (e) => {
    e.preventDefault();
    const jobData = getJobDetails();
    const {
      data: { session },
    } = await window.supabaseClient.auth.getSession();
    if (session) {
      const { data: crmData, error } = await window.supabaseClient
        .from("crm")
        .insert({
          ...jobData,
          user_id: session.user.id,
        });
      alert(
        crmData ? "✅ Added Job Data to CRM" : `Error Occured: ${error.message}`
      );
    }
  };

  submitSection.appendChild(btn);
}

window.onload = () => {
  setTimeout(addButton, 2000); // Delay to ensure everything is loaded
};
