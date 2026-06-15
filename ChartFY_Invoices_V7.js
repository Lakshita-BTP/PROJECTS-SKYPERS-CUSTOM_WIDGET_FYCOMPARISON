(function () {

  /*
   * Enhancement:
   * - Replaced fixed pixel-based bar heights with percentage-based scaling.
   * - Updated chart layout to use available widget space dynamically.
   * - Added responsive behavior so bars automatically adjust when the SAC widget is resized.
   * - Improved maintainability by removing hardcoded chart height dependencies.
   */

  class FYComparisonWidget extends HTMLElement {

    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      this.shadowRoot.innerHTML = `
      <style>

      .outer{
          width:100%;
          height:100%;
          padding:5px;
          box-sizing:border-box;
      }

      .card{
          width:100%;
          height:100%;

          background:#ffffff;
          border-radius:12px;

          box-shadow:0 0 11px rgba(0,0,0,0.10);

          position:relative;
          overflow:hidden;

          display:flex;
          flex-direction:column;

          font-family:Arial,sans-serif;
      }

      .header{
          background:#1b2a41;
          color:white;
          font-size:15px;
          font-weight:bold;
          text-align:center;
          padding:12px;
          text-transform:uppercase;
      }

      .header-unit{
          color:#e2c17f;
          margin-left:4px;
      }

      .chart{
          flex:1;
          display:flex;
          align-items:flex-end;
          gap:20px;
          overflow-x:auto;
          overflow-y:hidden;
          padding:20px 15px 5px;
          min-width:0;
      }

      .chart::-webkit-scrollbar{
          height:8px;
      }

      .chart::-webkit-scrollbar-thumb{
          background:#c0c0c0;
          border-radius:4px;
      }

      .group{
          flex:0 0 100px;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          align-items:center;
      }

      .value-row{
          display:flex;
          gap:8px;
          margin-bottom:5px;
          font-size:11px;
          font-weight:bold;
      }

      .inv-value{
          color:#1b2a41;
      }

      .col-value{
          color:#e6782d;
      }

      .bars{
          display:flex;
          gap:5px;
          align-items:flex-end;
          height:70%;
      }

      .bar{
          width:26px;
          border-radius:4px 4px 0 0;
      }

      .bar-inv{
          background:#1b2a41;
      }

      .bar-col{
          background:#e6782d;
      }

      .fy{
          margin-top:8px;
          font-size:12px;
          font-weight:bold;
          color:#6b7d99;
      }

      .legend{
          display:flex;
          justify-content:center;
          gap:25px;
          padding:10px;
          font-size:12px;
      }

      .legend-item{
          display:flex;
          align-items:center;
          gap:6px;
      }

      .legend-box{
          width:12px;
          height:12px;
          border-radius:2px;
      }

      .inv{
          background:#1b2a41;
      }

      .col{
          background:#e6782d;
      }

      </style>

      <div class="outer">
          <div class="card">

              <div class="header">
                  <span class="header-text">
                      FY-WISE INVOICED VS COLLECTED
                  </span>

                  <span class="header-unit">
                      ₹ Crore
                  </span>
              </div>

              <div id="chart" class="chart">
                  Loading...
              </div>

              <div class="legend">
                  <div class="legend-item">
                      <div class="legend-box inv"></div>
                      Invoiced
                  </div>

                  <div class="legend-item">
                      <div class="legend-box col"></div>
                      Collected
                  </div>
              </div>
          </div>
      </div>
      `;
    }

    connectedCallback() {
      this.render();
    }

    set myDataBinding(dataBinding) {
      this._myDataBinding = dataBinding;
      this.render();
    }

    render() {

      const chart =
        this.shadowRoot.getElementById("chart");

      if (!this._myDataBinding) {
        chart.innerHTML = "No Data Binding Assigned";
        return;
      }

      if (this._myDataBinding.state !== "success") {
        chart.innerHTML = "Loading Data...";
        return;
      }

      try {

        const dimension =
          this._myDataBinding.metadata.feeds.dimensions.values[0];

        const measures =
          this._myDataBinding.metadata.feeds.measures.values;

        if (measures.length < 2) {
          chart.innerHTML =
            "Please bind 2 measures (Invoiced & Collected)";
          return;
        }

        const data = [];

        let maxValue = 0;

        this._myDataBinding.data.forEach((row) => {

          const fy =
            row[dimension].label;

          const invoiced =
            Number(row[measures[0]].raw || 0);

          const collected =
            Number(row[measures[1]].raw || 0);

          maxValue =
            Math.max(maxValue, invoiced, collected);

          data.push({
            fy,
            invoiced,
            collected
          });

        });

        let html = "";

        data.forEach((item) => {

          const invHeight =
            (item.invoiced / maxValue) * 100;

          const colHeight =
            (item.collected / maxValue) * 100;

          html += `
          <div class="group">

              <div class="value-row">

                  <div class="inv-value">
                      ${item.invoiced.toLocaleString()}
                  </div>

                  <div class="col-value">
                      ${item.collected.toLocaleString()}
                  </div>

              </div>

              <div class="bars">

                  <div
                    class="bar bar-inv"
                    style="height:${invHeight}%">
                  </div>

                  <div
                    class="bar bar-col"
                    style="height:${colHeight}%">
                  </div>

              </div>

              <div class="fy">
                  ${item.fy}
              </div>

          </div>
          `;
        });

        chart.innerHTML = html;

      }
      catch (e) {

        chart.innerHTML =
          "<pre>" + e.message + "</pre>";

        console.error(e);

      }
    }
  }

  customElements.define(
    "com-max-fycomparison",
    FYComparisonWidget
  );

})();