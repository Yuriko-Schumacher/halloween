d3.csv("data/candy-data.csv").then(function (data) {
	console.log(data);
	data.sort(function (a, b) {
		return d3.ascending(+a.winpercent, +b.winpercent);
	});
	// define dementions of SVG
	const width = document.querySelector("#rank-bar").clientWidth;
	const height = document.querySelector("#rank-bar").clientHeight;
	const margin = { top: 25, right: 25, bottom: 75, left: 75 };

	// create SVG canvas
	const svg = d3
		.select("#rank-bar")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// create scales
	const xScale = d3
		.scaleLinear()
		.domain([0, 1])
		.range([margin.left, width - margin.right]);

	const yScale = d3
		.scaleBand()
		.domain(d3.range(data.length))
		.range([height - margin.bottom, margin.top])
		.padding(0.4);

	// draw grid major lines
	const tickValues = [0, 0.2, 0.4, 0.6, 0.8];
	tickValues.forEach((number) => {
		svg.append("line")
			.attr("x1", xScale(number))
			.attr("y1", margin.top)
			.attr("x2", xScale(number))
			.attr("y2", height - margin.bottom)
			.attr("stroke", "lightgray")
			.attr("stroke-width", 1);
	});

	// draw bars
	const bars = svg
		.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", margin.left)
		.attr("y", function (d, i) {
			return yScale(i);
		})
		.attr("width", function (d) {
			return xScale(d.winpercent) - margin.left;
		})
		.attr("height", yScale.bandwidth())
		.attr("fill", "lightgray")
		.attr("stroke", "gray")
		.attr("stroke-width", 0);

	// draw axes
	const xAxis = d3
		.axisBottom()
		.scale(xScale)
		.tickValues(tickValues)
		.tickFormat(d3.format(".0%"));
	svg.append("g")
		.attr("transform", `translate(0, ${height - margin.bottom})`)
		.attr("class", "axis")
		.call(xAxis);

	const yAxis = d3.axisLeft().scale(yScale).tickValues([]);
	svg.append("g")
		.attr("transform", `translate(${margin.left}, 0)`)
		.attr("class", "axis")
		.call(yAxis);
	// draw axis labels
	const xAxisLabel = svg
		.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height - margin.bottom / 2)
		.attr("text-anchor", "middle")
		.text("Win rate");

	const yAxisMorePopular = svg
		.append("text")
		.attr("class", "axis-label")
		.attr("x", -margin.top)
		.attr("y", margin.left / 2 + 10)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "end")
		.text("More Popular");

	const yAxisLessPopular = svg
		.append("text")
		.attr("class", "axis-label")
		.attr("x", -height + margin.bottom)
		.attr("y", margin.left / 2 + 10)
		.attr("transform", "rotate(-90)")
		.text("Less Popular");

	// filter by buttons
	const attributes = [
		"chocolate",
		"fruity",
		"caramel",
		"crispedricewafer",
		"peanutyalmondy",
		"nougat",
	];
	const colors = [
		"#fc4c02", // chocolate orange
		"#00B098", // fruity green
		"#B39005", // caramel ocher
		"#FF29EF", // crispy pink
		"#671DB3", // peanut purple
		"#0F9DFC", // nougat blue
	];
	const filteredBars = [];
	attributes.forEach((attribute) => {
		let filteredBar = bars.filter(function (d) {
			return d[`${attribute}`] === "1";
		});
		filteredBars.push(filteredBar);
	});

	d3.selectAll(".button").on("click", function () {
		bars.attr("fill", "lightgray");
		let id = d3.select(this).property("id");
		let index = attributes.findIndex((attribute) => attribute === id);
		let selection = filteredBars[index];
		selection.attr("fill", `${colors[index]}`);
	});

	// tooltip
	const tooltip = d3
		.select("#rank-bar")
		.append("div")
		.attr("class", "tooltip");

	bars.on("mouseover", function (e, d) {
		let x = parseFloat(d3.select(this).attr("width"));
		let y = parseFloat(d3.select(this).attr("y")) + yScale.bandwidth();
		tooltip
			.style("visibility", "visible")
			.style("left", `${x + margin.left + 20}px`)
			.style("top", `${y}px`)
			.html(
				`Candy: <b>${d.competitorname}</b><br>Win rate: <b>${
					Math.round(+d.winpercent * 10 ** 4) / 100
				}</b> %`
			);
		d3.select(this).attr("stroke-width", 2);
	}).on("mouseout", function (e, d) {
		tooltip.style("visibility", "hidden");
		d3.select(this).attr("stroke-width", 0);
	});

	// scrolly
	const container = d3.select("#scrolly__bar");
	const stepSel = container.selectAll(".step");
	const hoverBar = (id) => {
		bars.attr("stroke-width", 0);
		let bar = bars.filter(function (d) {
			return d.competitorname === `${id}`;
		});
		let x = +bar.attr("width");
		let y = +bar.attr("y") + yScale.bandwidth();
		tooltip
			.style("visibility", "visible")
			.style("left", `${x + margin.left + 20}px`)
			.style("top", `${y}px`)
			.html(
				`Candy: <b>${
					bar.data()[0].competitorname
				}</b><br>Win rate: <b>${
					Math.round(+bar.data()[0].winpercent * 10 ** 4) / 100
				}</b> %`
			);
		bar.attr("stroke-width", 2);
	};
	const colorBars = (id) => {
		bars.attr("fill", "lightgray").attr("stroke-width", 0);
		tooltip.style("visibility", "hidden");
		let i = attributes.findIndex((attribute) => attribute === id);
		console.log(id);
		let selection = filteredBars[i];
		selection.attr("fill", `${colors[i]}`);
		d3.select(`#${id}`)
			.style("background-color", colors[i])
			.classed("shadow", true);
	};

	const updateChart = (index) => {
		stepSel.classed("is-active", (d, i) => i === index);
		let sel = container.select(`[data-index="${index}"]`);
		let id = sel.attr("data-id");
		if (index === 0) {
			bars.attr("stroke-width", 0);
			tooltip.style("visibility", "hidden");
			d3.selectAll(".button").each(function () {
				d3.select(this).classed("shadow", false);
			});
		} else if (index === 1 || index === 2) {
			bars.attr("fill", "lightgray");
			d3.selectAll(".button").each(function () {
				d3.select(this)
					.style("background-color", "lightgray")
					.classed("shadow", false);
			});
			hoverBar(id);
		} else if (index === 3 || index == 4) {
			d3.selectAll(".button").each(function () {
				d3.select(this).node().disabled = true;
				d3.select(this)
					.style("background-color", "lightgray")
					.classed("shadow", false)
					.classed("enabled", false);
			});
			colorBars(id);
			bars.on("mouseover", function (e, d) {
				let x = parseFloat(d3.select(this).attr("width"));
				let y =
					parseFloat(d3.select(this).attr("y")) + yScale.bandwidth();
				tooltip
					.style("visibility", "visible")
					.style("left", `${x + margin.left + 20}px`)
					.style("top", `${y}px`)
					.html(
						`Candy: <b>${d.competitorname}</b><br>Win rate: <b>${
							Math.round(+d.winpercent * 10 ** 4) / 100
						}</b> %`
					);
				d3.select(this).attr("stroke-width", 2);
			}).on("mouseout", function (e, d) {
				tooltip.style("visibility", "hidden");
				d3.select(this).attr("stroke-width", 0);
			});
		} else if (index === 5) {
			bars.attr("fill", "lightgray");
			d3.selectAll(".button").each(function (button, i) {
				d3.select(this).node().disabled = false;
				d3.select(this)
					.style("background-color", colors[i])
					.classed("shadow", false)
					.classed("enabled", true);
			});
			bars.on("mouseover", function (e, d) {
				let x = parseFloat(d3.select(this).attr("width"));
				let y =
					parseFloat(d3.select(this).attr("y")) + yScale.bandwidth();
				tooltip
					.style("visibility", "visible")
					.style("left", `${x + margin.left + 20}px`)
					.style("top", `${y}px`)
					.html(
						`Candy: <b>${d.competitorname}</b><br>Win rate: <b>${
							Math.round(+d.winpercent * 10 ** 4) / 100
						}</b> %<br>Attributes: <span id="candy-attributes"></span>`
					);
				let dataForThis = d3.select(this).data();
				const attributesToBeRemoved = ["hard", "bar", "pluribus"];
				let attributesInThis = Object.keys(dataForThis[0])
					.filter(
						(attribute) =>
							!attributesToBeRemoved.includes(attribute)
					)
					.filter((key) => {
						return dataForThis[0][key] === "1";
					});
				const svgForColorCircles = d3
					.select("#candy-attributes")
					.append("svg")
					.attr("width", 70)
					.attr("height", 16);

				attributesInThis.forEach((attribute, i) => {
					let index = attributes.findIndex((el) => el === attribute);
					svgForColorCircles
						.append("circle")
						.attr("cx", i * 16 + 8)
						.attr("cy", 10)
						.attr("r", 5)
						.attr("fill", colors[index])
						.attr("stroke", "white")
						.attr("stroke-width", 0.5);
				});
				d3.select(this).attr("stroke-width", 2);
			}).on("mouseout", function (e, d) {
				tooltip.style("visibility", "hidden");
				d3.select(this).attr("stroke-width", 0);
			});
		}
	};

	const init = () => {
		// Stickyfill.add(d3.select(".sticky").node());

		enterView({
			selector: stepSel.nodes(),
			offset: 0.5,
			enter: (el) => {
				let index = +d3.select(el).attr("data-index");
				updateChart(index);
			},
			exit: (el) => {
				let index = +d3.select(el).attr("data-index");
				index = Math.max(0, index - 1);
				updateChart(index);
			},
		});
	};

	init();
});
