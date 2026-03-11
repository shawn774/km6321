<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SingPioneers Knowledge Graph Explorer</title>

  <script src="cytoscape.min.js"></script>
  <script src="cola.min.js"></script>
  <script src="cytoscape-cola.js"></script>
  <script src="layout-base.js"></script>
  <script src="cose-base.js"></script>
  <script src="cytoscape-fcose.js"></script>
  <script src="weaver.min.js"></script>
  <script src="cytoscape-spread.js"></script>
  <script src="SP.get.python.js"></script>

  <style>
    :root{
      --bg:#f6f7fb;
      --panel:#ffffff;
      --sidebar:#eef2ff;
      --primary:#5b2c83;
      --primary-soft:#efe5ff;
      --accent:#7c3aed;
      --text:#1f2937;
      --muted:#6b7280;
      --border:#d8dce8;
      --shadow:0 8px 24px rgba(43, 54, 86, 0.10);
      --radius:14px;
    }

    *{
      box-sizing:border-box;
    }

    body{
      margin:0;
      font-family:Arial, Helvetica, sans-serif;
      background:var(--bg);
      color:var(--text);
    }

    header{
      background:linear-gradient(135deg, #4c1d95, #7c3aed);
      color:white;
      padding:20px 28px;
      box-shadow:0 4px 18px rgba(76, 29, 149, 0.25);
    }

    header h1{
      margin:0;
      font-size:28px;
      font-weight:700;
    }

    header p{
      margin:8px 0 0 0;
      font-size:14px;
      opacity:0.95;
      max-width:900px;
      line-height:1.5;
    }

    .page-wrap{
      display:flex;
      min-height:calc(100vh - 98px);
    }

    .main-leftmenu{
      width:290px;
      min-width:290px;
      background:var(--sidebar);
      border-right:1px solid var(--border);
      padding:20px 16px 28px 16px;
      overflow-y:auto;
    }

    .main-panel{
      flex:1;
      padding:22px;
      min-width:0;
    }

    .panel-card{
      background:var(--panel);
      border:1px solid var(--border);
      border-radius:var(--radius);
      box-shadow:var(--shadow);
      padding:18px;
      margin-bottom:18px;
    }

    .sidebar-title{
      font-size:22px;
      margin:0 0 4px 0;
      color:var(--primary);
    }

    .sidebar-subtitle{
      color:var(--muted);
      font-size:13px;
      margin-bottom:14px;
      line-height:1.5;
    }

    .section-note{
      font-size:12px;
      color:var(--muted);
      line-height:1.5;
      margin:6px 0 14px 0;
    }

    button{
      border:1px solid var(--border);
      background:#fff;
      color:var(--text);
      padding:9px 12px;
      border-radius:10px;
      cursor:pointer;
      transition:all 0.2s ease;
      font-size:14px;
    }

    button:hover{
      transform:translateY(-1px);
      box-shadow:0 4px 12px rgba(0,0,0,0.08);
    }

    .primary-btn{
      background:var(--primary);
      color:#fff;
      border-color:var(--primary);
    }

    .primary-btn:hover{
      background:#4a2370;
    }

    .light-btn{
      background:var(--primary-soft);
      color:var(--primary);
      border-color:#d9c3ff;
    }

    select, input[type="text"]{
      width:100%;
      padding:10px 12px;
      border:1px solid var(--border);
      border-radius:10px;
      background:white;
      font-size:14px;
      margin-top:6px;
    }

    label{
      font-size:14px;
    }

    .checkbox-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:6px 10px;
      margin-top:10px;
      margin-bottom:14px;
    }

    .checkbox-grid label{
      display:flex;
      align-items:center;
      gap:6px;
      font-size:13px;
      color:#374151;
    }

    .accordion{
      width:100%;
      text-align:left;
      font-weight:700;
      color:var(--primary);
      background:#fff;
      border:1px solid var(--border);
      margin-top:12px;
      border-radius:12px;
      box-shadow:0 3px 10px rgba(0,0,0,0.04);
      position:relative;
    }

    .accordion:after{
      content:'+';
      float:right;
      color:var(--muted);
      font-size:16px;
      font-weight:bold;
    }

    .accordion.active:after{
      content:'–';
    }

    .accordion.active,
    .accordion:hover{
      background:#f7f0ff;
    }

    .panel{
      max-height:0;
      overflow:auto;
      transition:max-height 0.25s ease;
      padding:0 4px;
    }

    .step-title{
      margin:14px 0 6px 0;
      font-size:14px;
      font-weight:700;
      color:#374151;
    }

    .button-stack{
      display:flex;
      flex-direction:column;
      gap:8px;
      margin-top:10px;
      margin-bottom:10px;
    }

    .button-stack button{
      width:100%;
      text-align:left;
    }

    .function-box{
      background:#fff;
      border:1px solid var(--border);
      border-radius:12px;
      padding:12px;
      margin-top:12px;
    }

    .function-box h4{
      margin:0 0 8px 0;
      color:var(--primary);
      font-size:15px;
    }

    .topbar-card{
      background:var(--panel);
      border:1px solid var(--border);
      border-radius:var(--radius);
      box-shadow:var(--shadow);
      padding:18px 20px;
      margin-bottom:18px;
    }

    .topbar-card h2{
      margin:0 0 8px 0;
      color:var(--primary);
      font-size:24px;
    }

    .topbar-card p{
      margin:0;
      color:var(--muted);
      line-height:1.6;
      font-size:14px;
    }

    #canvasWithMenu{
      display:block;
      width:100%;
      min-height:760px;
    }

    #canvas-menu{
      min-height:48px;
      background:var(--primary-soft);
      border:1px solid #d9c3ff;
      border-radius:12px 12px 0 0;
      padding:10px;
      display:block;
      font-size:14px;
      line-height:1.8;
    }

    #canvas-menu b{
      color:var(--primary);
    }

    #canvas-menu button{
      margin:2px 3px;
      background:white;
    }

    #cy{
      width:100%;
      min-height:640px;
      border:1px solid #d9c3ff;
      border-top:none;
      border-radius:0 0 12px 12px;
      background:#fcfaff;
      box-shadow:0 8px 20px rgba(124, 58, 237, 0.08);
    }

    #table1{
      margin-top:18px;
      background:#fff;
      border:1px solid var(--border);
      border-radius:12px;
      padding:14px;
      box-shadow:var(--shadow);
      overflow:auto;
    }

    #query2{
      margin-top:24px;
      color:var(--primary);
    }

    .modal2{
      display:none;
      position:fixed;
      z-index:10;
      right:10px;
      top:20px;
      width:340px;
      max-height:650px;
      resize:both;
      overflow:auto;
      padding:10px;
    }

    .modal2-content{
      background-color:#f6efff;
      text-align:left;
      width:95%;
      max-height:610px;
      box-shadow:0 8px 24px rgba(124, 58, 237, 0.18);
      color:#3d2c5a;
      line-height:1.4;
      font-family:"Times New Roman", Times, serif;
      font-weight:normal;
      padding:12px;
      overflow:auto;
      border-radius:12px;
      border:1px solid #dfc7ff;
    }

    .close, .pin{
      color:#666;
      float:right;
      font-size:24px;
      font-weight:bold;
    }

    .pin-push{
      border-style:inset;
      border-width:2px;
      border-color:#e8ddff;
      background-color:#d9c8ff;
    }

    .close:hover, .close:focus, .pin:hover, .pin:focus{
      color:black;
      text-decoration:none;
      cursor:pointer;
    }

    .sidepanel{
      position:fixed;
      z-index:9;
      height:420px;
      width:290px;
      top:170px;
      right:-272px;
      resize:vertical;
      overflow:auto;
      background:#f6fbef;
      color:#32422f;
      text-align:left;
      line-height:1.4;
      font-family:"Times New Roman", Times, serif;
      padding:0;
      transition:0.5s;
      border:1px solid #dbe7ce;
      border-radius:12px 0 0 12px;
      box-shadow:var(--shadow);
    }

    .sidepanel:hover{
      right:0;
    }

    .sidepanel-pin, .sidepanel-pin2{
      right:0;
    }

    .transition-delay{
      transition-delay:0.5s;
    }

    hr{
      border:none;
      border-top:1px solid var(--border);
      margin:16px 0;
    }

    small{
      color:var(--muted);
    }

    @media (max-width: 1100px){
      .page-wrap{
        flex-direction:column;
      }

      .main-leftmenu{
        width:100%;
        min-width:100%;
        border-right:none;
        border-bottom:1px solid var(--border);
      }

      .sidepanel{
        display:none;
      }
    }
  </style>
</head>

<body>

  <header>
    <h1>SingPioneers Knowledge Graph Explorer</h1>
    <p>
      Explore Singapore pioneers through graph visualization, relationship groups, and interactive intelligent functions.
      Use the left panel to browse pioneers, special topics, and network-based analysis.
    </p>
  </header>

  <div class="page-wrap">

    <div id="main-leftmenu" class="main-leftmenu">
      <div class="panel-card">
        <h2 class="sidebar-title">Browse & Explore</h2>
        <div class="sidebar-subtitle">
          Select a pioneer, choose relation groups, and run interactive graph queries.
        </div>

        <div class="function-box">
          <h4>Intelligent Function 1</h4>
          <div class="section-note">Explore a selected pioneer under chosen relation groups.</div>
        </div>

        <div class="function-box">
          <h4>Intelligent Function 2</h4>
          <div class="section-note">Identify influential individuals by relation-group connectivity.</div>
        </div>
      </div>

      <button class="accordion">Pioneers</button>
      <div class="panel">
        <div class="step-title">Step 1. Select pioneer</div>
        <label for="Pioneer">Pioneer</label>
        <select id="Pioneer" name="Pioneer">
          <option value="Chen_Wen_Hsi">Select</option>
          <option value="Ambo_Sooloh">Ambo Sooloh</option>
          <option value="Chen_Wen_Hsi">Chen Wen Hsi</option>
          <option value="Chia_Boon_Leong">Chia Boon Leong</option>
          <option value="Choo_Seng_Quee">Choo Seng Quee</option>
          <option value="EW_Barker">EW Barker</option>
          <option value="Hedwig_Anuar">Hedwig Anuar</option>
          <option value="John_Chia_Keng_Hock">John Chia Keng Hock</option>
          <option value="Lee_Kip_Lin">Lee Kip Lin</option>
          <option value="Lee_Seng_Gee">Lee Seng Gee</option>
          <option value="Lim_Chong_Pang">Lim Chong Pang</option>
          <option value="Lim_Tze_Peng">Lim Tze Peng</option>
          <option value="Lim_Yong_Liang">Lim Yong Liang</option>
          <option value="LM_Pennefather">LM Pennefather</option>
          <option value="Loke_Wan_Tho">Loke Wan Tho</option>
          <option value="P_Govindasamy_Pillai">P Govindasamy Pillai</option>
          <option value="Paul_Abisheganaden">Paul Abisheganaden</option>
          <option value="R_Jumabhoy">R Jumabhoy</option>
          <option value="Tan_Eng_Joo">Tan Eng Joo</option>
          <option value="Yusof_Ishak">Yusof Ishak</option>
          <option value="Zubir_Said">Zubir Said</option>
        </select>

        <div class="step-title">Step 2. Select types of relationship</div>
        <div class="checkbox-grid">
          <label><input type="checkbox" id="achievement" value="achievement">achievement</label>
          <label><input type="checkbox" id="art" value="art">art</label>
          <label><input type="checkbox" id="award" value="award">award</label>
          <label><input type="checkbox" id="business" value="business">business</label>
          <label><input type="checkbox" id="creator_of" value="creator_of">author of</label>
          <label><input type="checkbox" id="football" value="football">football</label>
          <label><input type="checkbox" id="interpersonal" value="interpersonal" checked>interpersonal</label>
          <label><input type="checkbox" id="kinship" value="kinship" checked>kinship</label>
          <label><input type="checkbox" id="leisure" value="leisure">leisure</label>
          <label><input type="checkbox" id="movie" value="movie">movie</label>
          <label><input type="checkbox" id="music" value="music">music</label>
          <label><input type="checkbox" id="official_of" value="official_of">official of</label>
          <label><input type="checkbox" id="organization" value="organization">organization</label>
          <label><input type="checkbox" id="performance" value="performance">performance</label>
          <label><input type="checkbox" id="philanthropy" value="philanthropy">philanthropy</label>
          <label><input type="checkbox" id="place" value="place">place</label>
          <label><input type="checkbox" id="school" value="school">school</label>
          <label><input type="checkbox" id="sports" value="sports">sports</label>
          <label><input type="checkbox" id="URL" value="URL">URL</label>
        </div>

        <div class="step-title">Step 3. Run query</div>
        <button id="checkbox_submit" class="primary-btn">Submit</button>
        <div class="section-note">Use this to display the selected pioneer with selected relationship types.</div>
      </div>

      <button class="accordion">Social Networks</button>
      <div class="panel">
        <div class="button-stack">
          <button id="network_kin">Inter-personal Network</button>
          <button id="network_school">School Network</button>
          <button id="network_business">Business Network</button>
          <button id="network_community">Community Network</button>
          <button id="network_culture">Culture Network</button>
          <button id="network_sports">Sports / Leisure Network</button>
        </div>
      </div>

      <button class="accordion">Entities</button>
      <div class="panel">
        <div class="button-stack">
          <button id="entity_school">Schools</button>
          <button id="entity_business">Business Entities</button>
          <button id="entity_culture">Cultural / Artistic Entities</button>
          <button id="entity_sports">Sports / Hobbies</button>
          <button id="entity_community">Community / Social / Political</button>
          <button id="entity_org">All Organizations</button>
          <button id="entity_movie">Movies</button>
          <button id="entity_music">Music</button>
          <button id="entity_art">Art / Paintings</button>
          <button id="entity_creative">All Creative Works</button>
          <button id="entity_event">Events</button>
          <button id="entity_law">Laws</button>
          <button id="entity_place">Places</button>
          <button id="entity_building">Buildings</button>
          <button id="entity_award">Awards / Recognition</button>
        </div>
      </div>

      <button class="accordion">Special Topics</button>
      <div class="panel">
        <div class="button-stack">
          <button id="special_interethnic">Inter-ethnic Relations</button>
          <button id="special_interethnic_table">Inter-ethnic List in Table</button>
          <button id="special_multi">Multiple Links Between Persons</button>
          <button id="special_triad">Triadic Relation Structure</button>
          <button id="special_triad_table">Triadic List in Table</button>
        </div>
      </div>

      <button class="accordion">Relationship Path</button>
      <div class="panel">
        <div class="step-title">Entity A</div>
        <input type="text" id="keywordA" name="keywordA" placeholder="Enter keyword"/>
        <button id="button-keywordA" class="light-btn" style="margin-top:8px;">Search</button>
        <select id="entityA" name="entityA"></select>

        <div class="step-title">Entity B</div>
        <input type="text" id="keywordB" name="keywordB" placeholder="Enter keyword"/>
        <button id="button-keywordB" class="light-btn" style="margin-top:8px;">Search</button>
        <select id="entityB" name="entityB"></select>

        <div class="button-stack" style="margin-top:14px;">
          <button id="button-path" class="primary-btn">Find Path from Entity A to B</button>
          <button id="button-entityA">Display Just Entity A</button>
        </div>
      </div>

      <button class="accordion">Intelligent Functions</button>
      <div class="panel">
        <div class="button-stack">
          <button id="btn-group-network" class="primary-btn">Run Group Network Exploration</button>
          <button id="btn-top-influential" class="light-btn">Show Influential Individuals</button>
        </div>
        <div class="section-note">
          Use the selected pioneer and relation types above to support the two intelligent functions implemented in the project.
        </div>
      </div>
    </div>

    <div id="main-panel" class="main-panel">
      <div class="topbar-card">
        <h2 id="query">Singapore Pioneers – Knowledge Graph & Social Network</h2>
        <p>
          Use the menu on the left to display pioneers, social networks, special topics, and intelligent-function results.
          Click nodes or edges to inspect metadata. Double-click a node to expand nearby relationships.
        </p>
      </div>

      <div id="canvasWithMenu">
        <div id="canvas-menu">
          <b>Graph layout:</b>
          <button id="layout-breadthfirst">Tree</button>
          <button id="layout-concentric">Concentric</button>
          <button id="layout-fcose">Force-Cose</button>
          <button id="layout-cola">Force-Cola</button>
          <button id="layout-spread">Spread</button>
          <button id="clear_canvas" class="light-btn">Clear</button>
          <button id="zoom-minus" class="light-btn">-</button>
          <button id="zoom-reset" class="light-btn">Reset Zoom</button>
          <button id="zoom-plus" class="light-btn">+</button>
          <button id="fullscreen" class="primary-btn">Fullscreen</button>
          <br/>
          Suggestion: click a node or relationship to display metadata. Double-click a node to expand its neighboring entities.
        </div>

        <div id="cy"></div>

        <h2 id="query2"></h2>
        <div id="table1"></div>

        <div id="graph-popup1" class="modal2">
          <div class="modal2-content">
            <span id="graph-popup1-close" class="close">&times;</span>
            <span id="graph-popup1-pin" class="pin" style="font-size:0.8em;">&#128204;</span>
            <p style="color:#5b2c83; font-weight:500;">
              <u>Drag</u> this info box to a new location.<br/>
              <u>Double-click</u> inside the box to close, or click X.<br/>
              <u>Click</u> on <span id="graph-popup1-pin2" style="font-size:0.9em;">&#128204;</span> to pin and resize the box.
            </p>
            <hr/>
            <div id="graph-popup1-content"></div>
            <div id="graph-popup1-menu">
              <button id="node-expand">Expand Node</button>
              <button id="node-remove">Remove Node</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="sidepanel1" class="sidepanel flex-container">
    <div style="text-align:center;width:20px;font-weight:bold;font-family:arial,sans-serif;background-color:#d7e8bc;">
      <br/><br/>&#9874;<br/><br/>T<br/>O<br/>O<br/>L<br/>B<br/>O<br/>X
    </div>

    <div style="padding:10px;">
      <span id="sidepanel-pin2" class="pin" style="font-size:0.8em;">&#128204;</span>
      <small>Hover to open graph filters</small>

      <button class="accordion">Filter</button>
      <div id="panel-filter" class="panel">
        <div id="panel-filter-help" style="visibility:hidden; color:#8b1e54;"></div>

        <div id="checkboxes-nodeTypes">
          <br/>
          <span style="color:#8b1e54;">
            First, display a graph on the canvas by clicking buttons on the left panel.
            Then a list of node types will appear here for filtering.
          </span>
          <br/><br/>
        </div>

        <button id="checkbox_clear1" style="visibility:hidden">&#9744; Uncheck all</button>
        <button id="checkbox_reset1" style="visibility:hidden">&#9745; Check all</button><br/>
        <button id="checkbox_submit1" style="visibility:hidden; background-color:#dbe7ff;">Apply filter</button><br/><br/>

        <div id="checkboxes-edgeTypes"></div>
        <button id="checkbox_clear2" style="visibility:hidden">&#9744; Uncheck all</button>
        <button id="checkbox_reset2" style="visibility:hidden">&#9745; Check all</button><br/>
        <button id="checkbox_submit2" style="visibility:hidden; background-color:#dbe7ff;">Apply filter</button><br/><br/>
      </div>

      <button class="accordion">Other Tools</button>
      <div class="panel">
        <p>More tools can be added here later.</p>
      </div>
    </div>
  </div>

</body>
</html>
