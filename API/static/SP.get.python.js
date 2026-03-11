(function(){ 
  document.addEventListener('DOMContentLoaded', function(){

    console.log('SP.get.python.js loaded');
    console.log('Current API domain:', window.location.origin);

    /** Utility functions **/
    let $ = selector => document.querySelector(selector);
    const API_domain = window.location.origin;

    /* Control size of display canvas. And resize when browser window change size */	
    let resizeCanvas = () => {
      let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      let canvasHeight = '400px';
      let canvasWidth = '600px';
      let cyHeight = '360px';

      if (h > 400) {
        canvasHeight = h + 'px';
        cyHeight = (h - 60) + 'px';
      }
      if (w - 160 > 600) {
        canvasWidth = (w - 262) + 'px';
      }

      if ($('#canvasWithMenu')) $('#canvasWithMenu').style.height = canvasHeight;
      if ($('#canvasWithMenu')) $('#canvasWithMenu').style.width = canvasWidth;
      if ($('#canvas-menu')) $('#canvas-menu').style.width = canvasWidth;
      if ($('#cy')) $('#cy').style.height = cyHeight;
      if ($('#cy')) $('#cy').style.width = canvasWidth;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Adjust canvas width when entering or exiting fullscreen mode
    let fullscreen_resize = () => { 
      if (document.fullscreenElement) {
        if ($('#canvasWithMenu')) $('#canvasWithMenu').style.width = '100%';
        if ($('#canvas-menu')) $('#canvas-menu').style.width = '100%';
        if ($('#cy')) $('#cy').style.width = '100%';
      } else {
        resizeCanvas();
      }
    };

    document.addEventListener('fullscreenchange', fullscreen_resize);
    document.addEventListener('mozfullscreenchange', fullscreen_resize);
    document.addEventListener('webkitfullscreenchange', fullscreen_resize);
    document.addEventListener('msfullscreenchange', fullscreen_resize);

    let cy;

    // Close graph popup info box
    if ($("#graph-popup1-close")) {
      $("#graph-popup1-close").addEventListener('click', function() { 
        $("#graph-popup1").style.display = "none"; 
      });
    }
    if ($("#graph-popup1")) {
      $("#graph-popup1").addEventListener('dblclick', function() { 
        $("#graph-popup1").style.display = "none"; 
      });
    }

    /** Make the popup info box draggable **/
    if (document.getElementById("graph-popup1") && document.getElementById("graph-popup1-pin")) {
      dragElement(document.getElementById("graph-popup1"), document.getElementById("graph-popup1-pin"));
    }

    if ($('#graph-popup1-pin2') && $('#graph-popup1-pin')) {
      $('#graph-popup1-pin2').addEventListener('click', function() { 
        $('#graph-popup1-pin').click(); 
      });
    }

    function dragElement(elmnt, pinElmnt) {
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      elmnt.onmousedown = dragMouseDown;
      elmnt.ontouchstart = dragMouseDown;
      pinElmnt.onclick = toggle;

      function toggle() {
        $('#graph-popup1-pin').classList.toggle("pin-push");
        if (elmnt.onmousedown != null) {
          elmnt.onmousedown = null;
          elmnt.ontouchstart = null;
        } else {
          elmnt.onmousedown = dragMouseDown;
          elmnt.ontouchstart = dragMouseDown;
        }
      }

      function dragMouseDown(e) {
        e = e || window.event;
        
        if ((e.clientX) && (e.clientY)) {
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag_mouse;
        } else if (e.targetTouches) {
          pos3 = e.targetTouches[0].clientX;
          pos4 = e.targetTouches[0].clientY;
          document.ontouchend = closeDragElement;
          document.ontouchmove = elementDrag_touch;
        }
      }

      function elementDrag_mouse(e) {
        e = e || window.event;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function elementDrag_touch(e) {
        e = e || window.event;
        pos1 = pos3 - e.targetTouches[0].clientX;
        pos2 = pos4 - e.targetTouches[0].clientY;
        pos3 = e.targetTouches[0].clientX;
        pos4 = e.targetTouches[0].clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
      }
    }

    /** Script for collapsible menu on left panel **/
    let acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }

    /** Helper: currently selected relations **/
    function getSelectedRelations(includeReference = false) {
      const relation_list = [];
      if (includeReference) relation_list.push('reference');

      const ids = [
        'achievement', 'art', 'award', 'business', 'creator_of', 'football',
        'interpersonal', 'kinship', 'leisure', 'movie', 'music', 'official_of',
        'organization', 'performance', 'philanthropy', 'place', 'school',
        'sports', 'URL'
      ];

      ids.forEach(id => {
        const el = $('#' + id);
        if (el && el.checked === true) relation_list.push(id);
      });

      return relation_list;
    }

    /** MAIN GRAPH RETRIEVE **/
    async function retrieve(parameter1, parameter2, queryID, elementID_query) {
      if (document.getElementById(elementID_query)) {
        document.getElementById(elementID_query).innerHTML = String(parameter1).replace(/_/g, ' ');
      }

      const API_router = 'SPget';
      const API_queryID = queryID;
      const API_param1 = encodeURIComponent(parameter1);
      const API_param2 = encodeURIComponent(Array.isArray(parameter2) ? parameter2.join(',') : parameter2);
      const API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param1}/${API_param2}`;

      fetch(API_string, { mode: "cors", method: "GET" })
        .then(response => {
          if (!response.ok) throw new Error("Server API didn't respond");
          return response.json();
        })
        .then(json_value => {   
          console.log(json_value);

          if (!json_value || json_value.length === 0) {
            if (document.getElementById(elementID_query)) {
              document.getElementById(elementID_query).innerHTML +=
                '<br/><span style="color:hsl(330, 100%, 50%); text-shadow:none">NO MATCH FOUND</span>';
            }
            return;
          }

          json2graph(json_value);

          if (queryID === 'keyword') { 
            cy.nodes('*').unlock();
            cy.layout(layouts['concentric']).run();
          } else if (queryID === '0') {
            cy.layout(layouts['cola']).run();
          } else {
            cy.nodes('*').unlock();
            cy.layout(layouts['fcose']).run();
            cy.reset();
            cy.layout(layouts['cola']).run();
          }
        })
        .catch(error => {
          console.error('Problem with the fetch operation from server API', error);
        });
    }

    /** TABLE RETRIEVE **/
    async function retrieve2(parameter1, parameter2, queryID, elementID_query) {
      if (document.getElementById(elementID_query)) {
        document.getElementById(elementID_query).innerHTML = 'Result table: ' + String(parameter1).replace(/_/g, ' ');
      }
      if ($("#table1")) {
        $("#table1").innerHTML = 'Retrieving result ...';
      }

      const API_router = 'SPget';
      const API_queryID = queryID;
      const API_param1 = encodeURIComponent(parameter1);
      const API_param2 = encodeURIComponent(Array.isArray(parameter2) ? parameter2.join(',') : parameter2);
      const API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param1}/${API_param2}`;

      fetch(API_string)
        .then(response => {
          if (!response.ok) throw new Error("Server API didn't respond");
          return response.json();
        })
        .then(records => {
          console.log(records);

          if (!records || records.length === 0) {
            $("#table1").innerHTML = "<p>No results found.</p>";
            return;
          }

          let txt = "<table style='border-spacing:2px; width:100%; border-collapse:collapse;'><tr>";
          for (let y of Object.keys(records[0])) {
            txt += "<th style='background-color:hsl(0,20%,80%); padding:8px; border:1px solid #ddd; text-align:left;'>" + y + "</th>";
          }
          txt += "</tr>";

          for (let x in records) {
            txt += "<tr>";
            for (let y of Object.values(records[x])) {
              txt += "<td style='padding:8px; border:1px solid #ddd;'>" + y + "</td>";
            }
            txt += "</tr>";
          }
          txt += "</table>";

          $("#table1").innerHTML = txt;
        })
        .catch(error => {
          console.error('Problem with the fetch operation from server API', error);
        });
    }

    /** KEYWORD SEARCH **/
    async function searchNode(keyword, dropdownList) {
      const API_router = 'SPget';
      const API_queryID = 'searchKeyword';
      const API_param1 = '_';
      const API_param2 = encodeURIComponent(keyword);
      const API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param1}/${API_param2}`;

      fetch(API_string)
        .then(response => {
          if (!response.ok) throw new Error("Server API didn't respond");
          return response.json();
        })
        .then(records => { 
          console.log(records);
          let menu_txt = '<option value="">Select</option>';
          for (let x of records) {
            menu_txt += `<option value="${x['id']}">${x['label']}</option>`;
          }
          document.getElementById(dropdownList).innerHTML = menu_txt;
        })
        .catch(error => {
          console.error('Problem with the fetch operation from server API', error);
        });
    }

    /** Process Neo4j node **/
    let process_node = node => {
      if (cy.$id(node.element_id).length == 0) {
        cy.add({ data: {
          id: node.element_id,
          supertype: node.supertype[0],
          id2: node.id
        }});
      }

      if (node.type && !nodeTypeRegistry.includes(node.type)) {
        nodeTypeRegistry.push(node.type);
      }

      let cy_ele = cy.$id(node.element_id);
      delete node.element_id;
      delete node.id;
      delete node.supertype;
      cy_ele.data(node);
    };

    /** Process Neo4j relation **/
    let process_relation = relation => {
      if (cy.$id(relation.element_id).length == 0) {
        cy.add({ data: {
          id: relation.element_id,
          source: relation.start_node,
          target: relation.end_node
        }});
      }

      if (relation.type && !edgeTypeRegistry.includes(relation.type)) {
        edgeTypeRegistry.push(relation.type);
      }

      let cy_ele = cy.$id(relation.element_id);
      delete relation.element_id;
      delete relation.start_node;
      delete relation.end_node;
      cy_ele.data(relation);
    };

    /** Add Neo4j result records to Cytoscape graph **/
    let json2graph = records => {
      if (!node_edge_removed.empty()) node_edge_removed.restore();

      for (let x of records) {
        if (typeof x.start_node === 'undefined') process_node(x);
      }

      for (let x of records) {
        if (typeof x.start_node !== 'undefined') process_relation(x);
      }

      toolboxFilter_createCheckboxes(nodeTypeRegistry, edgeTypeRegistry);

      if (cy.nodes().length > 50) {
        if ($('#panel-filter-help')) {
          $('#panel-filter-help').innerHTML = `<br/>Graph has ${cy.nodes().length} nodes. Consider applying a filter`;
          $('#panel-filter-help').style.visibility = 'visible';
        }
        if ($('#sidepanel1')) $('#sidepanel1').classList.add("sidepanel-pin","transition-delay");
      } else {
        if ($('#panel-filter-help')) {
          $('#panel-filter-help').innerHTML = '';
          $('#panel-filter-help').style.visibility = 'hidden';
        }
        if ($('#sidepanel1')) $('#sidepanel1').classList.remove("sidepanel-pin","transition-delay");
      }
    };

    /** Create cytoscape **/
    cy = cytoscape({
      container: $('#cy'),
      minZoom: 0.5,
      maxZoom: 4,
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            "label": "data(label)",
            "text-wrap": "wrap",
            "text-max-width": "180px",
            "background-color": "hsl(240,80%,90%)",
            "border-width": 0.0,
            "height": 30.0,
            "shape": "ellipse",
            "font-size": 12,
            "color": "hsl(240,80%,20%)",
            "text-opacity": 1.0,
            "text-valign": "center",
            "text-halign": "center",
            "font-family": "Tahoma, Arial, sans-serif",
            "font-weight": "normal",
            "border-opacity": 0.0,
            "border-color": "hsl(0,0%,100%)",
            "width": 50.0,
            "background-opacity": 1.0,
            "content": "data(label)"
          }
        },
        {
          selector: "edge",
          style: {
            "label": "data(type)",
            "text-wrap": "wrap",
            "text-max-width": "200px",
            "line-style": "solid",
            "curve-style": "bezier",
            "font-size": 12,
            "color": "hsl(240,80%,20%)",
            "line-color": "hsl(240,80%,70%)",
            "text-opacity": 1.0,
            "width": 1.0,
            "font-family": "Tahoma, Arial, sans-serif",
            "font-weight": "normal",
            "opacity": 1.0,
            "source-arrow-color": "hsl(0,0%,100%)",
            "source-arrow-shape": "none",
            "target-arrow-shape": "vee",
            "target-arrow-color": "hsl(240, 55%, 65%)",
            "target-arrow-fill": "hollow",
            "arrow-scale": 1,
            "content": "data(type)"
          }
        },
        {
          selector: "node[supertype = 'Person']",
          style: {
            "background-color": "hsl(80, 80%, 90%)",
            "shape": "round-rectangle",
            "height": 20.0,
            "border-width": 1.0,
            "border-opacity": 1.0,
            "border-color": "hsl(80, 80%, 50%)",
            "width": 80.0,
            "background-opacity": 1.0
          }
        },
        {
          selector: "node[supertype = 'Item']",
          style: {
            "background-color": "hsl(200, 80%, 90%)",
            "border-width": 1.0,
            "height": 20.0,
            "shape": "ellipse",
            "border-opacity": 1.0,
            "border-color": "hsl(200, 50%, 50%)",
            "width": 20.0,
            "background-opacity": 1.0
          }
        },
        {
          selector: "node[supertype = 'Class']",
          style: {
            "background-color": "hsl(280, 60%, 90%)",
            "shape": "triangle"
          }
        },
        {
          selector: "node[type = 'SingPioneer']",
          style: {
            "shape": "round-rectangle",
            "background-color": "hsl(0, 80%, 90%)",
            "height": 20.0,
            "width": 80.0,
            "border-width": 1.0,
            "border-opacity": 1.0,
            "border-color": "hsl(0, 60%, 70%)"
          }
        },
        {
          selector: "node:selected",
          style: {
            "background-color": "hsl(280,100%,70%)"
          }
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "hsl(280,100%,30%)"
          }
        }
      ]
    });

    let layouts = {
      cola: {
        name: 'cola',
        animate: true,
        refresh: 1,
        maxSimulationTime: 20000,
        ungrabifyWhileSimulating: false,
        fit: false,
        padding: 30,
        boundingBox: undefined,
        nodeDimensionsIncludeLabels: false,
        ready: function(){},
        stop: function(){},
        randomize: false,
        avoidOverlap: true,
        handleDisconnected: true,
        convergenceThreshold: 0.01,
        nodeSpacing: function(){ return 20; },
        centerGraph: true,
        edgeLength: 150
      },
      breadthfirst: {
        name: 'breadthfirst',
        fit: false,
        directed: true,
        padding: 30,
        circle: false,
        grid: false,
        spacingFactor: 1.5,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        maximal: false,
        animate: false,
        animationDuration: 500,
        animateFilter: function(){ return true; },
        transform: function(node, position){ return position; }
      },
      concentric: {
        name: 'concentric',
        fit: false,
        padding: 30,
        startAngle: 3 / 2 * Math.PI,
        clockwise: true,
        equidistant: false,
        minNodeSpacing: 10,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        concentric: function(node){ return node.degree(); },
        levelWidth: function(nodes){ return nodes.maxDegree() / 4; },
        animate: false,
        animationDuration: 500,
        animateFilter: function(){ return true; },
        transform: function(node, position){ return position; }
      },
      fcose: {
        name: 'fcose',
        quality: "default",
        randomize: true,
        animate: false,
        animationDuration: 1000,
        fit: true,
        padding: 30,
        nodeDimensionsIncludeLabels: false,
        packComponents: true,
        sampleSize: 25,
        nodeSeparation: 75,
        piTol: 0.0000001,
        nodeRepulsion: node => 15000,
        idealEdgeLength: edge => 100,
        edgeElasticity: edge => 0.45,
        nestingFactor: 0.1,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravity: 0.25,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
        initialEnergyOnIncremental: 0.3,
        ready: () => {},
        stop: () => {}
      },
      spread: {
        name: 'spread',
        animate: true,
        fit: true,
        minDist: 20,
        padding: 20,
        expandingFactor: -1.0,
        prelayout: { name: 'fcose' },
        maxExpandIterations: 4,
        randomize: false
      }
    };

    /** HTML listeners **/
    if ($('#Pioneer')) {
      $('#Pioneer').addEventListener('change', function() { 
        const relation_list = getSelectedRelations(true);
        retrieve($('#Pioneer').value, '_', '1b', 'query');
        retrieve($('#Pioneer').value, relation_list, '2a', 'query');
      });
    }

    if ($('#checkbox_submit')) {
      $('#checkbox_submit').addEventListener('click', function() { 
        const relation_list = getSelectedRelations(true);
        retrieve($('#Pioneer').value, '_', '1b', 'query');
        retrieve($('#Pioneer').value, relation_list, '2a', 'query');
      });
    }

    if ($('#network_kin')) $('#network_kin').addEventListener('click', function() { 
      retrieve('Inter-personal network', ['kinship', 'interpersonal'], 'relationList','query');
    });

    if ($('#network_school')) $('#network_school').addEventListener('click', function() { 
      retrieve('School network', ['school'], 'relationList','query');
    });

    if ($('#network_business')) $('#network_business').addEventListener('click', function() { 
      retrieve('Business network', ['business'], 'relationList','query');
    });

    if ($('#network_community')) $('#network_community').addEventListener('click', function() { 
      retrieve('Community network', ['organization', 'official_of'], 'relationList', 'query');
      retrieve('Community network', ['member_of'], 'rel_typeList', 'query');
    });

    if ($('#network_culture')) $('#network_culture').addEventListener('click', function() { 
      retrieve('Culture network', ['music', 'movie', 'creator_of', 'performance', 'art'], 'relationList','query');
      retrieve('Culture network', ['has_violin_teacher', 'has_art_teacher'], 'rel_typeList', 'query');
    });

    if ($('#network_sports')) $('#network_sports').addEventListener('click', function() { 
      retrieve('Sports&leisure network', ['sports', 'football', 'leisure'], 'relationList','query');
      retrieve('Sports&leisure network', ['sport_master_of', 'team_mate_of', 'talent_scouted_by', 'coached_by', 'coach_of', 'national_coach_of'], 'rel_typeList', 'query');
    });

    if ($('#entity_school')) $('#entity_school').addEventListener('click', function() { 
      retrieve('Schools', ['Educational_Organization', 'Primary_School', 'Secondary_School', 'Tertiary_Institution', 'Teacher'], 'node_typeList', 'query');
    });

    if ($('#entity_business')) $('#entity_business').addEventListener('click', function() { 
      retrieve('Business entities', ['Shipping', 'Company', 'Local_Company', 'Multinational', 'Business', 'Industry', 'Businessman'], 'node_typeList','query');
    });

    if ($('#entity_culture')) $('#entity_culture').addEventListener('click', function() { 
      retrieve('Cultural & artistic entities', ['Orchestra', 'Performing_Group', 'Ten_Men_Grp', 'Cultural', 'Artist', 'Composer', 'Musician', 'Orchestra_Conductor', 'Painter', 'Performer', 'Singer'], 'node_typeList','query');
    });

    if ($('#entity_sports')) $('#entity_sports').addEventListener('click', function() { 
      retrieve('Sports & Hobbies', ['Interest'], 'node_labelList', 'query');
      retrieve('Sports & Hobbies', ['Football', 'Sports', 'Athlete', 'Footballer'], 'node_typeList', 'query');
    });

    if ($('#entity_community')) $('#entity_community').addEventListener('click', function() { 
      retrieve('Community, Social, Political', ['Issue'], 'node_labelList', 'query');
      retrieve('Community, Social, Political', ['Newspaper', 'Information_Communication', 'Politics', 'Philanthropy', 'Social', 'Association', 'Government_Agency', 'NGO', 'Religious_Organization', 'Government_official', 'Librarian'], 'node_typeList','query');
    });

    if ($('#entity_org')) $('#entity_org').addEventListener('click', function() { 
      retrieve('All organizations', ['Organization'], 'node_labelList','query');
    });

    if ($('#entity_movie')) $('#entity_movie').addEventListener('click', function() { 
      retrieve('Movies', ['Film_industry', 'Movie', 'Actor'], 'node_typeList','query');
    });

    if ($('#entity_music')) $('#entity_music').addEventListener('click', function() { 
      retrieve('Music', ['Music', 'Anthem', 'Song', 'Symphony', 'Musician', 'Orchestra_Conductor', 'Performer', 'Singer', 'Composer', 'Violinist'], 'node_typeList','query');
    });

    if ($('#entity_art')) $('#entity_art').addEventListener('click', function() { 
      retrieve('Art & Paintings', ['Art', 'Painting', 'Calligraphy', 'Artist', 'Painter'], 'node_typeList','query');
    });

    if ($('#entity_creative')) $('#entity_creative').addEventListener('click', function() { 
      retrieve('All creative works', ['CreativeWork'], 'node_labelList', 'query');
    });

    if ($('#entity_event')) $('#entity_event').addEventListener('click', function() { 
      retrieve('Events', ['Event'], 'node_labelList', 'query');
    });

    if ($('#entity_law')) $('#entity_law').addEventListener('click', function() { 
      retrieve('Laws & Issues', ['Legal_Matter', 'Issue'], 'node_labelList', 'query');
      retrieve('Laws & Issues', ['Lawyer', 'Government_official'], 'node_typeList','query');
    });

    if ($('#entity_place')) $('#entity_place').addEventListener('click', function() { 
      retrieve('Places', ['Place'], 'node_labelList', 'query');
    });

    if ($('#entity_building')) $('#entity_building').addEventListener('click', function() { 
      retrieve('Buildings', ['Architecture', 'Project', 'Architect'], 'node_labelList', 'query');
    });

    if ($('#entity_award')) $('#entity_award').addEventListener('click', function() { 
      retrieve('Awards & Recognition', ['Award'], 'node_labelList', 'query');
    });

    if ($('#special_interethnic')) $('#special_interethnic').addEventListener('click', function() { 
      retrieve('Inter-ethnic relations', '_', 'interethnic', 'query');
    });

    if ($('#special_interethnic_table')) $('#special_interethnic_table').addEventListener('click', function() {
      retrieve2('Inter-ethnic relations', '_', 'interethnic_table', 'query2');
      if ($('#query2')) $('#query2').scrollIntoView();
    });

    if ($('#special_multi')) $('#special_multi').addEventListener('click', function() { 
      retrieve('Multiple bonds', '_', 'multi', 'query');
      retrieve('Multiple bonds', '_', 'multi2', 'query');
    });

    if ($('#special_triad')) $('#special_triad').addEventListener('click', function() { 
      retrieve('Triadic relation structure - may take 15 sec. to process', '_', 'triad', 'query');
    });

    if ($('#special_triad_table')) $('#special_triad_table').addEventListener('click', function() {
      retrieve2('Triadic relation structure', '_', 'triad_table', 'query2');
      if ($('#query2')) $('#query2').scrollIntoView();
    });

    if ($('#button-keywordA')) $('#button-keywordA').addEventListener('click', function() { 
      searchNode($('#keywordA').value, 'entityA');
    });

    if ($('#button-keywordB')) $('#button-keywordB').addEventListener('click', function() { 
      searchNode($('#keywordB').value, 'entityB');
    });

    if ($('#button-path')) $('#button-path').addEventListener('click', function() { 
      retrieve($('#entityA').value, $('#entityB').value, 'path','query');
    });

    if ($('#button-entityA')) $('#button-entityA').addEventListener('click', function() { 
      retrieve($('#entityA').value, '_', '0','query');
    });

    /** NEW BUTTONS **/
    console.log('Binding intelligent function buttons');

    if ($('#btn-group-network')) {
      $('#btn-group-network').addEventListener('click', function() {
        const pioneer = $('#Pioneer') ? $('#Pioneer').value : '';
        const relation_list = getSelectedRelations(false);

        if (!pioneer || pioneer === 'Select') {
          alert('Please select a pioneer first.');
          return;
        }

        if (relation_list.length === 0) {
          alert('Please select at least one relationship type.');
          return;
        }

        retrieve(pioneer, relation_list, 'group_network', 'query');
      });
    }

    if ($('#btn-top-influential')) {
      $('#btn-top-influential').addEventListener('click', function() {
        const relation_list = getSelectedRelations(false);

        if (relation_list.length === 0) {
          alert('Please select at least one relationship type.');
          return;
        }

        retrieve2('Influential Individuals', relation_list, 'top_influential_group', 'query2');
        if ($('#query2')) $('#query2').scrollIntoView();
      });
    }

    /** Cytoscape controls **/
    if ($('#layout-breadthfirst')) $('#layout-breadthfirst').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout(layouts['breadthfirst']).run(); });
    if ($('#layout-fcose')) $('#layout-fcose').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout(layouts['fcose']).run(); });
    if ($('#layout-concentric')) $('#layout-concentric').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout(layouts['concentric']).run(); });
    if ($('#layout-cola')) $('#layout-cola').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout(layouts['cola']).run(); });
    if ($('#layout-spread')) $('#layout-spread').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout(layouts['spread']).run(); });

    if ($('#clear_canvas')) {
      $('#clear_canvas').addEventListener('click', function(){ 
        cy.elements().remove();
        nodeTypeRegistry = [];
        edgeTypeRegistry = [];
        node_edge_removed = cy.collection();
        if ($('#panel-filter-help')) {
          $('#panel-filter-help').innerHTML =
            `<br/><span style='color:hsl(336, 100%, 30%)'>First, display a graph on the canvas by clicking on buttons on the left panel.<br/>
            Then a list of node types will display here for selection.</span><br/> <br/>`;
          $('#panel-filter-help').style.visibility = 'visible';
        }
        if ($('#sidepanel1')) $('#sidepanel1').classList.remove("sidepanel-pin","sidepanel-pin2","transition-delay");
        if ($('#sidepanel-pin2')) $('#sidepanel-pin2').classList.remove("pin-push");
        if ($('#checkboxes-nodeTypes')) $('#checkboxes-nodeTypes').innerHTML = '';
        if ($('#checkboxes-edgeTypes')) $('#checkboxes-edgeTypes').innerHTML = '';
        if ($('#checkbox_submit1')) $('#checkbox_submit1').style.visibility = 'hidden';
        if ($('#checkbox_submit2')) $('#checkbox_submit2').style.visibility = 'hidden';
        if ($('#checkbox_clear1')) $('#checkbox_clear1').style.visibility = 'hidden';
        if ($('#checkbox_clear2')) $('#checkbox_clear2').style.visibility = 'hidden';
        if ($('#checkbox_reset1')) $('#checkbox_reset1').style.visibility = 'hidden';
        if ($('#checkbox_reset2')) $('#checkbox_reset2').style.visibility = 'hidden';
        if ($('#table1')) $('#table1').innerHTML = '';
        if ($('#query2')) $('#query2').innerHTML = '';
      });
    }

    if ($('#zoom-reset')) $('#zoom-reset').addEventListener('click', function(){ cy.reset(); });
    if ($('#zoom-plus')) $('#zoom-plus').addEventListener('click', function(){ cy.zoom(cy.zoom() + 0.1); });
    if ($('#zoom-minus')) $('#zoom-minus').addEventListener('click', function(){ cy.zoom(cy.zoom() - 0.1); });

    if ($('#fullscreen')) {
      $('#fullscreen').addEventListener('click', function(){
        if ($('#canvasWithMenu').requestFullscreen) {
          $('#canvasWithMenu').requestFullscreen();
        } else if ($('#canvasWithMenu').webkitRequestFullscreen) {
          $('#canvasWithMenu').webkitRequestFullscreen();
        } else if ($('#canvasWithMenu').msRequestFullscreen) {
          $('#canvasWithMenu').msRequestFullscreen();
        }
        cy.reset();
      });
    }

    /** Cytoscape node/edge listeners **/
    let cy_addListener = cy => {
      cy.on('tap', 'node', function(event){
        let node = event.target;
        if (node.data()['type'] == 'Cluster') return;

        let txt = '<p><b>ID: ' + (node.data()['id2'] || '') + '</b></p>';
        txt = txt.replace(/_/g, ' ');

        for (let x in node.data()) {
          switch (x) {
            case 'id':
            case 'id2':
            case 'supertype':
              break;
            case 'comment':
              let comment_text = node.data()[x];
              comment_text = comment_text.replace(/\\n/g, '<br/>');
              comment_text = comment_text.replace(/\\/g, '');
              comment_text = comment_text.replace(/[‘’“”]/g, '\'');
              txt += '<p><em>comment</em>: ' + comment_text + '</p>';
              break;
            case 'birthDate':
            case 'deathDate':
            case 'date':
              txt += '<p><em>' + x + '</em>: ' + node.data()[x] + '</p>';
              break;
            case 'thumbnailURL':
              if (node.data().accessURL && node.data().thumbnailURL) {
                txt += '<p><a target="_blank" href="' + node.data().accessURL[0] + '">';
                txt += '<img alt="Photograph" width="200" src="' + node.data().thumbnailURL[0] + '"/></a></p>';
              }
              break;
            case 'accessURL':
              for (let link in node.data()[x]) {
                let link_URL = node.data().accessURL[link];
                let link_text = 'Webpage';
                if (link_URL.search("pdf") >= 0) link_text = 'PDF';
                else if (link_URL.search("jpg") >= 0) link_text = 'JPG';
                else if (link_URL.search("youtube") >= 0) link_text = 'YouTube';

                txt += '<p><a href="' + link_URL + '" target="_blank"><b>' + link_text + '</b></a></p>';
              }
              break;
            default:
              if (node.data()[x] !== '') txt += '<p><em>' + x + '</em>: ' + node.data()[x] + '</p>';
          }
        }

        if ($('#node-expand')) $('#node-expand').value = node.data()['id2'];
        if ($('#node-remove')) $('#node-remove').value = node.data()['id'];
        if ($('#graph-popup1-content')) $('#graph-popup1-content').innerHTML = txt;
        if ($('#graph-popup1')) $('#graph-popup1').style.display = 'block';
        if ($('#graph-popup1-menu')) $('#graph-popup1-menu').style.display = 'block';
      });

      cy.on('tap', 'edge', function(event){
        let edge = event.target;
        let txt = '<p><b>Relation: ' + (edge.data()['supertype'] || '') + '</b></p>';

        for (let x in edge.data()) {
          switch (x) {
            case 'id':
            case 'source':
            case 'target':
              break;
            case 'comment':
              let comment_text = edge.data()[x];
              comment_text = comment_text.replace(/\\n/g, '<br/>');
              comment_text = comment_text.replace(/\\/g, '');
              comment_text = comment_text.replace(/[‘’“”]/g, '\'');
              txt += '<p><em>comment</em>: ' + comment_text + '</p>';
              break;
            default:
              if (edge.data()[x] !== '') txt += '<p><em>' + x + '</em>: ' + edge.data()[x] + '</p>';
          }
        }

        if ($('#graph-popup1-content')) $('#graph-popup1-content').innerHTML = txt;
        if ($('#graph-popup1')) $('#graph-popup1').style.display = 'block';
        if ($('#graph-popup1-menu')) $('#graph-popup1-menu').style.display = 'none';
      });

      cy.on('cxttap', 'node', function(event){
        let node = event.target;
        node.select();
        if (node.data()['type'] == 'Cluster') return;
        cy.nodes('*').unlock();
        node.lock();
        retrieve(node.data()['id2'], '_', '0', 'query');
      });

      cy.on('dbltap', 'node', function(event){
        let node = event.target;
        node.select();
        if (node.data()['type'] == 'Cluster') return;
        cy.nodes('*').unlock();
        node.lock();
        retrieve(node.data()['id2'], '_', '0', 'query');
      });

      cy.on('tapstart', 'node', function(event){
        let node = event.target;
        node.unlock();
      });
    };
    cy_addListener(cy);

    if ($('#node-expand')) {
      $('#node-expand').addEventListener('click', function() { 
        cy.nodes('*').unlock();
        retrieve($('#node-expand').value, '_', '0', 'query');
      });
    }

    if ($('#node-remove')) {
      $('#node-remove').addEventListener('click', function() { 
        cy.$id($('#node-remove').value).remove();
      });
    }

    /** Side Panel & Toolbox **/
    let nodeTypeRegistry = [];
    let edgeTypeRegistry = [];
    let node_edge_removed = cy.collection();

    if (acc.length > 6) acc[6].click();

    if ($("#sidepanel-pin2")) {
      $("#sidepanel-pin2").addEventListener('click', function() { 
        if ($('#sidepanel1')) $('#sidepanel1').classList.toggle("sidepanel-pin2");
        $('#sidepanel-pin2').classList.toggle("pin-push");
      });
    }

    if ($("#sidepanel1")) {
      $("#sidepanel1").addEventListener('mouseenter', function() { 
        $('#sidepanel1').classList.remove("sidepanel-pin","transition-delay");
      });
      $("#sidepanel1").addEventListener('mouseleave', function() { 
        $('#sidepanel1').classList.add("transition-delay");
      });
    }

    let toolboxFilter_createCheckboxes = (nodeTypes, edgeTypes) => {
      let txt = '<br/><b>Select node types to retain in graph:</b><br/>';
      nodeTypes.sort();
      txt += nodeTypes.map(item => {
        return `<input type="checkbox" value="${item}" class="checkNode" checked>${item}<br>`;
      }).join('');
      if ($('#checkboxes-nodeTypes')) $('#checkboxes-nodeTypes').innerHTML = txt;

      txt = '<b>Select relation types to retain:</b><br/>';
      edgeTypes.sort();
      txt += edgeTypes.map(item => {
        return `<input type="checkbox" value="${item}" class="checkEdge" checked>${item}<br>`;
      }).join('');
      if ($('#checkboxes-edgeTypes')) $('#checkboxes-edgeTypes').innerHTML = txt;

      if ($('#checkbox_submit1')) $('#checkbox_submit1').style.visibility = 'visible';
      if ($('#checkbox_submit2')) $('#checkbox_submit2').style.visibility = 'visible';
      if ($('#checkbox_clear1')) $('#checkbox_clear1').style.visibility = 'visible';
      if ($('#checkbox_clear2')) $('#checkbox_clear2').style.visibility = 'visible';
      if ($('#checkbox_reset1')) $('#checkbox_reset1').style.visibility = 'visible';
      if ($('#checkbox_reset2')) $('#checkbox_reset2').style.visibility = 'visible';

      if (acc.length > 6) {
        acc[6].click();
        acc[6].click();
      }
    };

    let apply_filter = () => {
      if (!node_edge_removed.empty()) node_edge_removed.restore();

      let node_edge_collection = cy.collection();
      let checkedList = [];
      let checkedListValue = [];

      checkedList = document.querySelectorAll('.checkEdge:checked');
      for (let i = 0; i < checkedList.length; i++) {
        checkedListValue.push(checkedList[i].value);
      }

      let uncheckedEdgeTypes = [];
      edgeTypeRegistry.forEach(item => {
        if (!checkedListValue.includes(item) && !uncheckedEdgeTypes.includes(item)) {
          uncheckedEdgeTypes.push(item);
        }
      });

      let selector = '';
      for (let i = 0; i < uncheckedEdgeTypes.length; i++) {
        selector = `edge[type = "${uncheckedEdgeTypes[i]}"]`;
        node_edge_collection = node_edge_collection.union(selector);
      }

      checkedList = document.querySelectorAll('.checkNode:checked');
      checkedListValue = [];
      for (let i = 0; i < checkedList.length; i++) {
        checkedListValue.push(checkedList[i].value);
      }

      let uncheckedNodeTypes = [];
      nodeTypeRegistry.forEach(item => {
        if (!checkedListValue.includes(item) && !uncheckedNodeTypes.includes(item)) {
          uncheckedNodeTypes.push(item);
        }
      });

      for (let i = 0; i < uncheckedNodeTypes.length; i++) {
        selector = `node[type = "${uncheckedNodeTypes[i]}"]`;
        node_edge_collection = node_edge_collection.union(selector);
      }
      node_edge_removed = cy.remove(node_edge_collection);
    };

    if ($('#checkbox_submit1')) $('#checkbox_submit1').addEventListener('click', apply_filter);
    if ($('#checkbox_submit2')) $('#checkbox_submit2').addEventListener('click', apply_filter);

    if ($('#checkbox_clear1')) $('#checkbox_clear1').addEventListener('click', function(){   
      document.querySelectorAll('.checkNode').forEach(function(checkbox){ checkbox.checked = false; });
    });

    if ($('#checkbox_clear2')) $('#checkbox_clear2').addEventListener('click', function(){
      document.querySelectorAll('.checkEdge').forEach(function(checkbox){ checkbox.checked = false; });
    });

    if ($('#checkbox_reset1')) $('#checkbox_reset1').addEventListener('click', function(){   
      document.querySelectorAll('.checkNode').forEach(function(checkbox){ checkbox.checked = true; });
    });

    if ($('#checkbox_reset2')) $('#checkbox_reset2').addEventListener('click', function(){
      document.querySelectorAll('.checkEdge').forEach(function(checkbox){ checkbox.checked = true; });
    });

  });
})();
