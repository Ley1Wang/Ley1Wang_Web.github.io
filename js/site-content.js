// Shared, factual project descriptions and experiment notes. No visitor data.
window.PortfolioContent = {
  "categories": {
    "physics": {
      "file": "physics.html",
      "name": "Physics",
      "number": "01",
      "eyebrow": "The physical world, made explorable",
      "title": "A small change.<br>A clearer understanding.",
      "description": "Move a charge. Release a pendulum. Trace a ray. These experiments make the relationship between a model and its behavior easier to see.",
      "note": "Interactive models for exploring ideas—not substitutes for laboratory measurements.",
      "image": "pendulum-lab"
    },
    "statistics": {
      "file": "stat.html",
      "name": "Statistics",
      "number": "02",
      "eyebrow": "From observations to understanding",
      "title": "Let the data<br>tell a fuller story.",
      "description": "Explore distributions, sampling, and inference with tools that put the plot next to the calculation—and the assumptions next to the result.",
      "note": "Educational tools with explicit model notes. Check assumptions before interpreting a result.",
      "image": "probability-distribution"
    },
    "cs": {
      "file": "cs.html",
      "name": "Computer Science",
      "number": "03",
      "eyebrow": "Software, from sketch to system",
      "title": "Build it. Run it.<br>Look a little closer.",
      "description": "A collection of coding tools, algorithms, data pipelines, and web experiments. Each project distinguishes the public demo from what needs a local service.",
      "note": "Look for the mode label: browser tool, archived data, simulated request, or local service.",
      "image": "code-lab"
    },
    "radar": {
      "file": "Radar.html",
      "name": "Radar",
      "number": "04"
    }
  },
  "projects": [
    {
      "id": "pendulum-lab",
      "file": "pendulum-lab.html",
      "title": "Pendulum Motion Lab",
      "categories": [
        "physics"
      ],
      "topic": "Mechanics",
      "mode": "Interactive lab",
      "description": "Compare an ideal prediction with nonlinear motion. Change one variable, record a trial, and follow the evidence.",
      "try": "Start with a small release angle, record an oscillation, then increase the angle while keeping length and gravity fixed.",
      "notice": "Compare the measured period, the small-angle prediction, and the energy trace. Restart between trials for a fair comparison.",
      "limits": "A point-mass pendulum with a rigid, massless rod and optional damping; not a full model of a real suspension."
    },
    {
      "id": "electric-field",
      "file": "electric-field.html",
      "title": "Electric Field Studio",
      "categories": [
        "physics"
      ],
      "topic": "Electromagnetism",
      "mode": "Interactive lab",
      "description": "Arrange positive and negative charges, then read the field as a pattern of direction, strength, and potential.",
      "try": "Drag two opposite charges apart, then place two charges of the same sign at equal distances from the center.",
      "notice": "Look for symmetry and locations where field vectors cancel. Vector direction and potential describe different properties.",
      "limits": "A two-dimensional view of ideal point charges. Values near a charge are softened for stable visualization."
    },
    {
      "id": "wave-interference",
      "file": "wave-interference.html",
      "title": "Wave Interference",
      "categories": [
        "physics"
      ],
      "topic": "Waves",
      "mode": "Interactive lab",
      "description": "Bring two sources together and discover how phase, spacing, and wavelength reshape an interference pattern.",
      "try": "Keep the sources fixed and change their phase difference. Then change wavelength without moving the sources.",
      "notice": "Follow regions where the waves reinforce or cancel. Changing one parameter makes the pattern easier to interpret.",
      "limits": "An idealized coherent-wave visualization rather than a complete simulation of boundaries, diffraction, or material losses."
    },
    {
      "id": "kirchhoff",
      "file": "kirchhoff.html",
      "title": "Kirchhoff’s Circuit Lab",
      "categories": [
        "physics"
      ],
      "topic": "Circuits",
      "mode": "Interactive lab",
      "description": "Connect circuit values to live currents and equations, with node and loop rules shown alongside the diagram.",
      "try": "Change one resistor or source value and compare the resulting currents with the displayed node and loop equations.",
      "notice": "Use the indicated current directions consistently. A negative value means the solution runs opposite to the chosen direction.",
      "limits": "Ideal components and the circuit topology shown; this is an educational model, not a circuit-design or safety tool."
    },
    {
      "id": "lens-ray-tracing",
      "file": "lens-ray-tracing.html",
      "title": "Lens & Image Formation",
      "categories": [
        "physics"
      ],
      "topic": "Optics",
      "mode": "Interactive lab",
      "description": "Trace principal rays through a convex lens and connect object position to image distance, orientation, and scale.",
      "try": "Move the object toward the focal point, then compare the image before and after crossing it.",
      "notice": "Read image distance and magnification together. Very large values near the focal point may extend beyond the drawing.",
      "limits": "A thin-lens, paraxial model in common arbitrary units (u). The diagram fits the main geometry; images far outside the view are reported numerically. Lens aberrations are not modeled."
    },
    {
      "id": "freefalling",
      "file": "freefalling.html",
      "title": "Planetary Freefall",
      "categories": [
        "physics"
      ],
      "topic": "Mechanics",
      "mode": "Interactive lab",
      "description": "Take the same drop to different worlds and compare motion, velocity, and acceleration under each gravity.",
      "try": "Use the same starting height on Earth and the Moon, restarting the drop after each change.",
      "notice": "Compare impact time with the velocity and fallen-distance traces. Playback speed changes wall-clock duration, not the equations. Pause or export the trial to inspect it.",
      "limits": "Constant gravity, released from rest, with no air resistance. The scene rescales to the chosen height; the end condition is physical impact rather than a pixel boundary."
    },
    {
      "id": "lenz",
      "file": "lenz.html",
      "title": "Induction Sketch",
      "categories": [
        "physics"
      ],
      "topic": "Electromagnetism",
      "mode": "Simplified model",
      "description": "Explore a moving magnet and a compact B × v × N calculation, with the demonstration’s assumptions made explicit.",
      "try": "Double the speed or turn count separately and compare the model output.",
      "notice": "The animation illustrates relative motion; its speed is not coupled to the calculation. The displayed load is fixed at 5 Ω.",
      "limits": "The legacy B × v × N expression is a simplified teaching relationship, not a full flux-based induction model or a calibrated coil prediction."
    },
    {
      "id": "Plot",
      "file": "Plot.html",
      "title": "Scatter Plot & Regression",
      "categories": [
        "physics",
        "statistics"
      ],
      "topic": "Data analysis",
      "mode": "Browser tool",
      "description": "Turn measured pairs into a scatter plot, fit a straight line, and inspect the relationship behind the coefficients.",
      "try": "Add several points with different x values, then move one observation away from the trend.",
      "notice": "Watch how the fitted slope and intercept respond. A fit summarizes association; it does not establish causation.",
      "limits": "An ordinary least-squares line with an intercept. A vertical set of points cannot produce a finite slope."
    },
    {
      "id": "descriptive-statistics",
      "file": "descriptive-statistics.html",
      "title": "Descriptive Statistics",
      "categories": [
        "statistics"
      ],
      "topic": "Explore",
      "mode": "Browser tool",
      "description": "Read the center, spread, and shape of a dataset through summary values, a histogram, and a box plot.",
      "try": "Calculate the sample dataset, then add a large outlier and compare the mean with the median.",
      "notice": "Use the plots alongside the numbers. Variance and standard deviation here divide by the dataset size (population convention).",
      "limits": "A learning calculator for numeric datasets. Quartiles use the median-of-halves convention; other tools may use different definitions."
    },
    {
      "id": "probability-distribution",
      "file": "probability-distribution.html",
      "title": "Distribution Explorer",
      "categories": [
        "statistics"
      ],
      "topic": "Probability",
      "mode": "Interactive lab",
      "description": "Compare normal, binomial, and Poisson distributions through adjustable parameters and live summary values.",
      "try": "Change the spread of a normal distribution, then switch to a binomial distribution and vary its probability.",
      "notice": "Distinguish a continuous density curve from discrete probability bars; their vertical values have different meanings.",
      "limits": "Plots show a finite display range. They are illustrations of the chosen model, not a goodness-of-fit test for observed data."
    },
    {
      "id": "central-limit-theorem",
      "file": "central-limit-theorem.html",
      "title": "The Central Limit Experiment",
      "categories": [
        "statistics"
      ],
      "topic": "Sampling",
      "mode": "Interactive lab",
      "description": "Sample repeatedly from different populations and watch a distribution of means take shape.",
      "try": "Choose the skewed population. Run the same number of repetitions with a small sample size, then a larger one.",
      "notice": "Compare the shape and spread of the sample means, not the shape of the original population.",
      "limits": "The same seed and inputs reproduce the same draws. Normal-approximation quality depends on the population and sample size; a finite histogram is not a proof. The normal reference is not a fitted distribution."
    },
    {
      "id": "confidence-interval",
      "file": "confidence-interval.html",
      "title": "Mean Confidence Interval",
      "categories": [
        "statistics"
      ],
      "topic": "Inference",
      "mode": "Browser tool",
      "description": "Translate a sample summary into an interval estimate and see how confidence and sample size affect its width.",
      "try": "Keep the sample mean and standard deviation fixed, then compare the available confidence levels and sample sizes.",
      "notice": "Higher confidence widens the interval; the formula used by this tool is a normal-critical-value approximation.",
      "limits": "Uses z critical values with the supplied standard deviation. It is not an exact small-sample t interval or a guarantee about one particular estimate."
    },
    {
      "id": "hypothesis-test",
      "file": "hypothesis-test.html",
      "title": "Hypothesis Test Lab",
      "categories": [
        "statistics"
      ],
      "topic": "Inference",
      "mode": "Interactive lab",
      "description": "Make a one-sample test visible: choose a model, inspect the statistic, and compare a p-value with a decision threshold.",
      "try": "Keep the data summary fixed and change the alternative hypothesis or significance level.",
      "notice": "A p-value is calculated under the null model. The decision threshold changes a rule, not the observed evidence.",
      "limits": "Assumptions and numerical approximations matter. This is a teaching aid, not a substitute for checking study design and model suitability."
    },
    {
      "id": "chi-square-test",
      "file": "chi-square-test.html",
      "title": "Chi-square Independence",
      "categories": [
        "statistics"
      ],
      "topic": "Inference",
      "mode": "Browser tool",
      "description": "Move from a 2 × 2 table of counts to expected frequencies, a test statistic, and an interpretable comparison.",
      "try": "Change the balance between the two groups while keeping row totals similar, then run the test again.",
      "notice": "Compare observed and expected counts. Sparse expected cells can make the asymptotic approximation unreliable.",
      "limits": "An uncorrected Pearson chi-square test with one degree of freedom. Use valid nonnegative counts and check expected-count assumptions."
    },
    {
      "id": "bootstrap-simulator",
      "file": "bootstrap-simulator.html",
      "title": "Bootstrap Resampling",
      "categories": [
        "statistics"
      ],
      "topic": "Sampling",
      "mode": "Interactive lab",
      "description": "Resample an observed dataset and build a distribution of means, including an approximate percentile interval.",
      "try": "Run the same dataset several times, then increase the number of resamples to compare stability.",
      "notice": "The simulation resamples the data you supplied; more repetitions do not repair an unrepresentative original sample.",
      "limits": "Displays an approximate 95% percentile interval for the mean. Results vary with random resampling and are not bias-corrected."
    },
    {
      "id": "bayes-diagnostic",
      "file": "bayes-diagnostic.html",
      "title": "Bayes & Base Rates",
      "categories": [
        "statistics"
      ],
      "topic": "Probability",
      "mode": "Educational model",
      "description": "Use prevalence and test characteristics to explore why a positive result does not tell the whole story.",
      "try": "Keep sensitivity and specificity fixed, then move prevalence from a low value to a higher one.",
      "notice": "Compare true and false positive counts, then read the conditional probability among positive results.",
      "limits": "An illustrative probability model only, not medical guidance or a diagnostic assessment. Its inputs are hypothetical."
    },
    {
      "id": "data-dashboard",
      "file": "data-dashboard.html",
      "title": "Data Overview Dashboard",
      "categories": [
        "statistics"
      ],
      "topic": "Explore",
      "mode": "Sample data",
      "description": "A compact dashboard that brings summary indicators, trends, and tabular data into a single readable view.",
      "try": "Read the summary indicators, then compare them with the chart and the rows beneath.",
      "notice": "A summary is only one view of the data. Compare magnitude, trend, and individual observations before drawing a conclusion.",
      "limits": "This page demonstrates dashboard presentation with sample data; it is not a live reporting service."
    },
    {
      "id": "code-lab",
      "file": "code-lab.html",
      "title": "Online Code Lab",
      "categories": [
        "cs"
      ],
      "topic": "Development tools",
      "mode": "Browser runtime",
      "description": "A focused editor for C++, C, Python, JavaScript, and Java. Add input, run a program, and read the result in place.",
      "try": "Choose a language, edit the starter program, and add standard input before running.",
      "notice": "Each language keeps its own local draft. Use Stop or Escape to interrupt a run.",
      "limits": "Runtime assets need internet on first use. This is a single-file console playground, not a full development machine."
    },
    {
      "id": "neural-digit",
      "file": "neural-digit.html",
      "title": "Handwritten Digit Recognition",
      "categories": [
        "cs"
      ],
      "topic": "Machine learning",
      "mode": "Local service required",
      "description": "Draw a digit and inspect a CNN’s prediction and class probabilities when the local inference service is running.",
      "try": "Start the local inference server, draw one centered digit, and compare a few writing styles.",
      "notice": "The confidence score belongs to the model; it is not a guarantee that a prediction is correct.",
      "limits": "The static site provides the drawing interface, not Python inference. A locally running Flask service and trained model are required."
    },
    {
      "id": "sorting-visualizer",
      "file": "sorting-visualizer.html",
      "title": "Sorting, Step by Step",
      "categories": [
        "cs"
      ],
      "topic": "Algorithms",
      "mode": "Interactive lab",
      "description": "Follow bubble, selection, and insertion sort through an array, with highlighted operations and live counters.",
      "try": "Use single-step on a small array, then reset the same array and choose another algorithm to compare counts.",
      "notice": "Value comparisons and array writes are counted separately. A swap uses two writes. Animation delay is a presentation control, not an algorithm benchmark.",
      "limits": "Reset preserves the starting array and its comparison records. Shuffle or size changes begin a new comparison. Counters exclude loop tests and temporary variables."
    },
    {
      "id": "movie-dashboard",
      "file": "movie-dashboard.html",
      "title": "Movie Data Dashboard",
      "categories": [
        "cs"
      ],
      "topic": "Data pipelines",
      "mode": "Archived data",
      "description": "Explore an archived movie dataset through rating counts and summaries, with the original React and Flask source alongside.",
      "try": "Compare the movie count and average rating with the rating distribution, then inspect the linked backend source.",
      "notice": "Separate the public snapshot view from the fuller crawler, database, and API workflow documented by the source.",
      "limits": "The portfolio reads bundled JSON. It does not run the crawler, React development server, or SQLite backend on GitHub Pages."
    },
    {
      "id": "douban-crawler",
      "file": "douban-crawler.html",
      "title": "Douban Movie Archive",
      "categories": [
        "cs"
      ],
      "topic": "Data pipelines",
      "mode": "Archived data",
      "description": "Browse a structured movie snapshot and trace its fields back to the Python collection script.",
      "try": "Inspect a few rows and follow a source link, then compare the saved fields with the crawler code.",
      "notice": "The table preserves a collected snapshot. Rank, rating, and availability may have changed since collection.",
      "limits": "No live scraping runs in the browser. Source websites may change their structure and access rules."
    },
    {
      "id": "baidu-crawler",
      "file": "baidu-crawler.html",
      "title": "Trending Topics Archive",
      "categories": [
        "cs"
      ],
      "topic": "Data pipelines",
      "mode": "Archived data",
      "description": "A small Requests and BeautifulSoup pipeline, presented with its structured snapshot and original Python source.",
      "try": "Compare a topic row with the fields produced by the linked collection script.",
      "notice": "An archive documents what was collected; it is not a live ranking or a claim about current trends.",
      "limits": "The displayed JSON is bundled with the site. Refreshing the page does not perform a new crawl."
    },
    {
      "id": "flask-api-lab",
      "file": "flask-api-lab.html",
      "title": "Frontend–Backend Request Lab",
      "categories": [
        "cs"
      ],
      "topic": "Web systems",
      "mode": "Simulated requests",
      "description": "Make GET parameters, POST bodies, and JSON responses concrete without needing a running backend.",
      "try": "Send a GET value, then submit a POST body and compare where the values appear in the response.",
      "notice": "Query parameters and a request body are distinct parts of a request, even when both carry text.",
      "limits": "This portfolio demo simulates responses locally. The linked Flask source documents the actual backend implementation."
    },
    {
      "id": "api-dashboard",
      "file": "api-dashboard.html",
      "title": "API Request Inspector",
      "categories": [
        "cs"
      ],
      "topic": "Web systems",
      "mode": "Simulated requests",
      "description": "Build a small request, edit its JSON body, and inspect a structured response in a dashboard-style workspace.",
      "try": "Compare GET queries with POST bodies, create a sample project, and inspect validation errors or a 405 response on a read-only route.",
      "notice": "Read the request inputs and returned structure together; a formatted response is not evidence of a live network service.",
      "limits": "Routes, statuses, and records are simulated in page memory. Reset or reload clears created records. No remote backend is called and no real request latency is measured."
    },
    {
      "id": "sql-helper",
      "file": "sql-helper.html",
      "title": "Python & SQL Table Lab",
      "categories": [
        "cs"
      ],
      "topic": "Web systems",
      "mode": "Browser demo",
      "description": "Try a small CRUD table, then connect the browser demonstration to a Python table class and SQL exercises.",
      "try": "Insert a row with a new ID, then remove it. Inspect the Python source for the wider table API.",
      "notice": "The browser demo demonstrates insert and delete; the source contains the broader abstraction and persistence exercises.",
      "limits": "The sample rows live in page memory and reset on reload. This is not an actual browser SQL database."
    },
    {
      "id": "portfolio",
      "file": "../index.html",
      "title": "This Portfolio",
      "categories": [
        "cs"
      ],
      "topic": "Web systems",
      "mode": "Static website",
      "description": "The collection itself: a lightweight, responsive website connecting working experiments, project notes, and source code.",
      "try": "Explore a project area, open a lab, then use the shared navigation to continue into another subject.",
      "notice": "The site keeps browser-only tools distinct from archived datasets and local-service projects.",
      "limits": "Static hosting serves the pages. Some projects intentionally require local runtimes or connected hardware.",
      "preview": "home"
    },
    {
      "id": "analytics",
      "file": "https://wangleyi.goatcounter.com",
      "title": "Lightweight Site Analytics",
      "categories": [
        "cs"
      ],
      "topic": "Web systems",
      "mode": "External dashboard",
      "description": "A separate GoatCounter dashboard used to understand page visits across the portfolio.",
      "try": "Open the external dashboard to see any statistics available under its access settings.",
      "notice": "Analytics are separate from the tools and experiments themselves.",
      "limits": "Availability and visibility are controlled by the external dashboard.",
      "external": true
    },
    {
      "id": "Radar",
      "file": "Radar.html",
      "title": "Presence Radar Scanner",
      "categories": [
        "radar"
      ],
      "topic": "Embedded systems",
      "mode": "Hardware + local service",
      "description": "A rotating presence-sensing prototype that links Arduino signals to a browser visualization of active directions.",
      "try": "Explore the public demonstration, then start the local viewer to connect the Arduino and sensor.",
      "notice": "The public sweep is demonstration data. The sensor reports presence; the visualization does not measure target distance.",
      "limits": "Live data needs the local Flask app, serial access, and the hardware. Servo angles are estimated, not encoder measurements."
    }
  ]
};
