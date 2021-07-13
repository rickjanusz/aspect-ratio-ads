(function() {
  "use strict";
  var win = window;
  var creatives = (win._$OGO$_ || (win._$OGO$_ = {})) &&  (win._$OGO$_.Rosetta || (win._$OGO$_.Rosetta = {})) && (win._$OGO$_.Rosetta.creatives || (win._$OGO$_.Rosetta.creatives = []));
  var Rosetta = win._$OGO$_.Rosetta;
  var require =  Rosetta.requirejs || require;

  function Creative(dmo){
    /* [START_CUSTOM_VARIABLES] */
    /* [END_CUSTOM_VARIABLES] */
    var registeredCallbacks = [], environStatuses = [],environTotals = 3, isEnvironReady = false, isCreativeReady = false;
    var R, Platform, Settings, Analytics, AnalyticsContent, TweenMax, TweenLite, TimelineLite, TimelineMax, EventForwarding, Hammer/* [INSERT_PLUGIN_VARS] */;

    var ROSETTA_VERSION = "4.40";
    var context = String(ROSETTA_VERSION + "_"  + dmo.embedId).split("_").join(".");
    var parentDiv, stage, animate, timeoutTimer, startTimer, FOF_PIXEL_DENSITY;
    var evergreenImg = "evergreen.jpg";
    var CENTER_STAGE = false;

    function init(wrapperID) {
      var subdirectory = "1266_CI_MP";
      var creativeName = "" || subdirectory;
      var companyID = "1001";
      var isSecure = (dmo.externalURL.indexOf("https:") > -1);



      var config = {
        context: context,
        waitSeconds: 5,
        paths: {},
        bundles: {
          "Rosetta":["core.pack","ad.pack","cnvr.advantage.pack","cnvr.usweb.pack","filters.pack","alignmentgroup.pack","hammer.pack","tweenmax.pack","ndots.pack","rotatorfade.pack","fontface.pack", "xmlpush.pack"]
        }
      };



      config.bundles.Rosetta = (function(bundles){
        if (typeof Object.create !== 'function'){
          var compatible = ["static.pack"];
          for (var i=0; i<bundles.length; i++){
            if (bundles[i].indexOf("cnvr.") > -1){
              compatible.push(bundles[i]);
            }
          }
          if (typeof dmo.rosettaBundles === "function"){compatible = dmo.rosettaBundles(compatible)} //jshint:ignore
          try {
            if (dmo && dmo.logEvent && typeof dmo.logEvent === "function"){
              dmo.logEvent.call(dmo, 210, 'Object.create');
            }
          } catch(e){};
          return compatible;
        }
        return bundles;
      })(config.bundles.Rosetta);


      dmo.atomSuffix = dmo.atomSuffix || "";
      config.paths["Rosetta"] = dmo.externalURL + "/atom/"+ROSETTA_VERSION+"/3.0.0/?scripts=" + "wrapper_start," + config.bundles.Rosetta.join(",") + ",wrapper_end" + dmo.atomSuffix;

      var req = require.config(config);
      req( ['require'].concat(config.bundles.Rosetta), function() {
        var Core = req("core/Core");
        Platform = req("platform/Platform");
        Settings = req("display/settings/GlobalSettings");
        Analytics = req("core/analytics/Analytics");
        AnalyticsContent = req("core/analytics/AnalyticsContent");
        EventForwarding = req("core/eventforwarding/EventForwarding");
        R = new Core();
        if (typeof dmo.rosettaLoaded === "function"){dmo.rosettaLoaded(req, R)}
        if (wrapperID){
          Settings.overwrite({prefix: wrapperID + "_"});
          parentDiv = document.getElementById(wrapperID);
        }
        parentDiv = parentDiv || document.body;
        Platform.overwrite({
          isSecure:isSecure,
          rosettaVersion:ROSETTA_VERSION,
          placementWidth:Number(dmo.mediaWidth) || 970,
          placementHeight:Number(dmo.mediaHeight) || 250,
          clientID:dmo.companyId || companyID
        });
        R.setFallback(fallback);

        if (R.isCompatible === true) {
          R.parseParameters(dmo.flashVars, 'flashvars');
          Platform.overwrite({
            clientID: R.create("var").set({name:"company_id", dataType:"String", defaultValue:Platform.fetch().clientID}).render().value(),
            cacheBuster: R.create("var").set({name:"bypass_cache", dataType:"Boolean", defaultValue:false, exposed:false}).render().value(),
            subdirectory:R.create("var").set({name:"subdirectory", dataType:"String", defaultValue:subdirectory}).render().value(),
            FOFVersion: R.create("var").set({name:"fof_version", dataType:"String", defaultValue:"2.1.6", exposed:false}).render().value(),
            isSecure: R.create("var").set({name:"dtm_secure", dataType:"Boolean", defaultValue:Platform.fetch().isSecure, exposed:false}).render().value(),
            analytics: dmo.logEvent,
            analyticsScope: dmo
          });
          if (R.create("var").set({name:"disable_retina", dataType:"Boolean", defaultValue:false, exposed:false}).render().value() === false
            && (R.environment.isRetina === true || R.create("var").set({name:"force_retina", dataType:"Boolean", defaultValue:false, exposed:false}).render().value())) {
            Settings.overwrite({pixelDensity: 2})
          }
          FOF_PIXEL_DENSITY =  (function(){
            var pxDensity = R.create("var").set({name:"fof_pixel_density", dataType:"Number", exposed:false, defaultValue:Settings.fetch().pixelDensity}).render().value();
            pxDensity = Math.round(pxDensity);
            if (pxDensity !== 1 && pxDensity !== 2){
              pxDensity = Settings.fetch().pixelDensity;
            }
            return pxDensity;
          })();
          startTimer = function(){
            var timeout = R.create("var").set({name:"default_timeout", dataType:"Number", defaultValue:5, exposed:false}).render().value();
            timeoutTimer = setTimeout(function(){
              var timeoutInstance = {
                event:AnalyticsContent.FALL_BACK,
                failReason: {
                  type:AnalyticsContent.TIMED_OUT,
                  details: timeout
                }
              };
              R.fallback(timeoutInstance)
            }, timeout*1000);
          };
          if (CENTER_STAGE){
            Analytics.fire({
              event: AnalyticsContent.INIT,
              instance: reveal,
              details:creativeName
            });
            var pds = parentDiv.style;
            pds.marginTop = -(Number(Platform.fetch().placementHeight) * .5) + "px";
            pds.marginLeft = -(Number(Platform.fetch().placementWidth) * .5) + "px";
            pds.top = "50%";
            pds.left = "50%";
            pds.position = "absolute";
          }
          evergreenImg = R.create("var").set({name:"evergreen_img", dataType:"String", defaultValue:evergreenImg}).render().value();
          assignSelector();
          createElements();
        } else {
          logEnvironStatus("NOT_COMPATIBLE", true);
          try {
            if (dmo && dmo.logEvent && typeof dmo.logEvent === "function"){
              if (config.bundles.Rosetta.join(",").indexOf("static.pack") === -1){
                dmo.logEvent.call(dmo, 210, 'R.isCompatible');
              }
            }
          } catch (e){}
          R.fallback();
        }
      }, function(e){
        log(e);
      });

      return reveal;
    }



    function createElements() {
      animate = animateElements;
      logEnvironStatus("createElements", "start");

      var width = R.create("var").set({
        name: "width",
        dataType: "Number",
        defaultValue: Platform.fetch().placementWidth,
        exposed: false
      }).render().value();
      var height = R.create("var").set({
        name: "height",
        dataType: "Number",
        defaultValue: Platform.fetch().placementHeight,
        exposed: false
      }).render().value();
      var borderColor = R.create("var").set({
        name: "border_color",
        dataType: "String",
        defaultValue: "#CCCCCC"
      }).render().value();

      stage = R.create("div").set({
        id: "stage",
        width: width,
        height: height,
        backgroundColor: "#FFFFFF",
        className: "stage"
      });
      parentDiv.appendChild(stage.element);
      Settings.overwrite({stage: stage});
      new EventForwarding().init({stage: stage});
      var borders = {
        l: R.create("div").set({
          width: "1px",
          height: height,
          backgroundColor: borderColor,
          left: 0,
          top: 0,
          zIndex: 1002,
          pointerEvents: "none",
          parentNode: stage
        }).render(),
        r: R.create("div").set({
          width: "1px",
          height: height,
          backgroundColor: borderColor,
          right: 0,
          top: 0,
          zIndex: 1002,
          pointerEvents: "none",
          parentNode: stage
        }).render(),
        t: R.create("div").set({
          width: width,
          height: "1px",
          backgroundColor: borderColor,
          left: 0,
          top: 0,
          zIndex: 1002,
          pointerEvents: "none",
          parentNode: stage
        }).render(),
        b: R.create("div").set({
          width: width,
          height: "1px",
          backgroundColor: borderColor,
          left: 0,
          bottom: 0,
          zIndex: 1002,
          pointerEvents: "none",
          parentNode: stage
        }).render()
      };



      var arrVal; // this is the current place in the array of sizes
      var currRatioFloat;

      var ratioArray = [ "4:1", "6:1", "8:1", "1:2", "1:3", "1:4", "1:1", "2:3", "3:1"];
      var floatArray = [4, 6, 8, .5, 0.333333333333333, .25, 1, 0.666666666666667, 3];
      var dimArray = ["970x250", "320x50", "728x90", "300x600", "300x1050", "160x600", "300x250", "320x480", "800x250"];

      function findClosestFloat(num, arr) {
        var curr = arr[0];
        var diff = Math.abs(num - curr);
        for (var val = 0; val < arr.length; val++) {
          var newdiff = Math.abs(num - arr[val]);
          if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val];
            arrVal = val;
          }
        }
        if (curr === arr[0]) {
          arrVal = 0;
        }
        return curr;
      }


      function updateCurrFloat() {
        var platformProps = Platform.fetch();
        var width = platformProps.placementWidth;
        var height = platformProps.placementHeight;
        currRatioFloat = width/height;
        findClosestFloat(currRatioFloat, floatArray);

        // console.group("Log Floats");
        // console.log("sArr: ", sArr);
        // console.log("Array #: ", arrVal);
        // console.log("Closest Float: ", findClosestFloat(currRatioFloat, floatArray));
        // console.log("Ratio: ", ratioArray[arrVal]);
        // console.groupEnd("Log Floats");
      }

      updateCurrFloat();

      var wTemp = getWidth();
      var hTemp = getHeight();

      var wX;
      var hX;


      var wXh = dimArray[arrVal].split("x");

      if (wTemp > 300 && arrVal === 6) {
        wX = 336;
        hX = 280;
      } else if (wTemp < 300 && arrVal === 6) {
        wX = 180;
        hX = 150;
      } else if (wTemp < 469 && arrVal === 2) {
        wX = 468;
        hX = 60;
      } else if (wTemp < 321 && arrVal === 8 ) {
        wX = 320;
        hX = 100;
      } else if (wTemp > 320 && arrVal === 1 ) {
        wX = 728;
        hX = 90;
      } else if (wTemp === 300 && hTemp === 1050 ) {
        wX = 300;
        hX = 1050;
      } else {
        wX = parseInt(wXh[0]);
        hX = parseInt(wXh[1]);
      }

      //apply CSS reset to stage class
      R.applyCSSReset(".stage");




      var adObj = {
        s970x250: {
          size: {
            width: 970,
            height: 250
          },
          details_text: {
            left: 881,
            top: 235,
            width: 82,
            height: 11,
            lineHeight: 1,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 800,
            top: 193,
            width: 112,
            height: 18,
            lineHeight: 0.93,
            letterSpacing: 1.4,
            fontSize: 14,
            color:"#231f20"
          },
          preheader_text: {
            left: 45,
            top: 90,
            width: 396,
            height: 21,
            lineHeight: 1.12,
            letterSpacing: 0.85,
            fontSize: 17
          },
          headline_text: {
            left: 45,
            top: 119,
            width: 396,
            height: 74,
            lineHeight: 0.98,
            letterSpacing: 0,
            marginTop:8,
            fontSize: 46
          },
          subhead_text: {
            left: 45,
            top: 199,
            width: 396,
            height: 27,
            lineHeight: 1.14,
            letterSpacing: -0.14,
            marginTop:6,
            fontSize: 14
          },
          logo_img: {
            left: 153,
            top: 34,
            width: 180,
            height: 28
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 485,
            height: 250
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 485,
            height: hTemp
          },
          cta_color: {
            left: 793,
            top: 183,
            width: 126,
            height: 34,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 147,
            top: 75,
            width: 191,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 940,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 950,
            height: 215,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 814,
            top: 163,
            width: 80,
            height: 10,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 517,
            top: 14,
            width: 221,
            height: 221
          },
          nDotActive: {
            borderRadius: 5,
            width: 10,
            height: 10
          },
          nDotInactive: {
            borderRadius: 5,
            width: 10,
            height: 10
          },
          nDots: {
            spacing: 4
          },
          catImg: {
            width: 221,
            height: 221
          },
          cat_text: {
            left: 771,
            top: 43,
            width: 169,
            height: 60,
            lineHeight: 1.13,
            letterSpacing: 0,
            fontSize: 16
          },
          price_text: {
            left: 771,
            top: 112,
            width: 169,
            height: 31,
            marginTop: 9,
            lineHeight: .9,
            fontSize: 20
          },
          rotatorFade: {
            width: 221,
            height: 221
          }
        },
        s160x600: {
          size: {
            width: 160,
            height: 600
          },
          details_text: {
            left: 63,
            top: 583,
            width: 91,
            height: 15,
            lineHeight: 1.5,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 30,
            top: 543,
            width: 100,
            height: 18,
            lineHeight: 1.08,
            letterSpacing: 1.2,
            fontSize: 12,
            color:"#231f20"
          },
          preheader_text: {
            left: 10,
            top: 86,
            width: 140,
            height: 26,
            lineHeight: 1.5,
            letterSpacing: 0.6,
            fontSize: 12
          },
          headline_text: {
            left: 10,
            top: 122,
            width: 140,
            height: 69,
            lineHeight: 0.97,
            letterSpacing: -0.32,
            marginTop: 10,
            fontSize: 32
          },
          subhead_text: {
            left: 10,
            top: 195,
            width: 140,
            height: 39,
            lineHeight: 1.15,
            letterSpacing: -0.13,
            marginTop: 4,
            fontSize: 13
          },
          logo_img: {
            left: 20,
            top: 35,
            width: 121,
            height: 19
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 160,
            height: 254
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: wTemp,
            height: 254
          },
          cta_color: {
            left: 25,
            top: 535,
            width: 110,
            height: 30,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 16,
            top: 67,
            width: 128,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 130,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 140,
            height: 565,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 44,
            top: 515,
            width: 74,
            height: 9,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 12,
            top: 279,
            width: 136,
            height: 136
          },
          nDotActive: {
            borderRadius: 4.5,
            width: 9,
            height: 9
          },
          nDotInactive: {
            borderRadius: 4.5,
            width: 9,
            height: 9
          },
          nDots: {
            spacing: 4
          },
          catImg: {
            width: 136,
            height: 136
          },
          cat_text: {
            left: 12,
            top: 418,
            width: 136,
            height: 39,
            lineHeight: 1.18,
            letterSpacing: 0,
            fontSize: 11
          },
          price_text: {
            left: 12,
            top: 463,
            width: 136,
            height: 26,
            marginTop: 6,
            lineHeight: 1.14,
            fontSize: 14
          },
          rotatorFade: {
            width: 136,
            height: 136
          }
        },
        s728x90: {
          size: {
            width: 728,
            height: 90
          },
          details_text: {
            left: 685,
            top: 76,
            width: 38,
            height: 11,
            lineHeight: 1,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 573,
            top: 60,
            width: 98,
            height: 18,
            lineHeight: 1.2,
            letterSpacing: -0.11,
            fontSize: 11,
            color:"#231f20"
          },
          preheader_text: {
            left: 173,
            top: 5,
            width: 222,
            height: 16,
            lineHeight: 1,
            letterSpacing: 0.6,
            fontSize: 12
          },
          headline_text: {
            left: 173,
            top: 26,
            width: 222,
            height: 38,
            lineHeight: 0.97,
            letterSpacing: -0.31,
            marginTop: 5,
            fontSize: 31
          },
          subhead_text: {
            left: 173,
            top: 66,
            width: 222,
            height: 20,
            lineHeight: 1.25,
            letterSpacing: -0.12,
            marginTop: 2,
            fontSize: 12
          },
          logo_img: {
            left: 23,
            top: 36,
            width: 114,
            height: 18
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 409,
            height: 90
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 409,
            height: hTemp
          },
          cta_color: {
            left: 570,
            top: 55,
            width: 104,
            height: 25,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 158,
            top: 15,
            width: 1,
            height: 60
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 698,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 708,
            height: 55,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 422,
            top: 9,
            width: 8,
            height: 73,
            direction: "vertical"
          },
          rotatorFadeContainer: {
            left: 459,
            top: 5,
            width: 80,
            height: 80
          },
          nDotActive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDotInactive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDots: {
            spacing: 5
          },
          catImg: {
            width: 80,
            height: 80
          },
          cat_text: {
            left: 551,
            top: 5,
            width: 142,
            height: 23,
            lineHeight: 1.18,
            letterSpacing: 0.11,
            fontSize: 11
          },
          price_text: {
            left: 551,
            top: 33,
            width: 142,
            height: 18,
            marginTop: 5,
            lineHeight: 1.15,
            fontSize: 13
          },
          rotatorFade: {
            width: 80,
            height: 80
          }
        },
        s300x600: {
          size: {
            width: 300,
            height: 600
          },
          details_text: {
            left: 224,
            top: 584,
            width: 70,
            height: 14,
            lineHeight: 1.25,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 94,
            top: 556,
            width: 112,
            height: 18,
            lineHeight: 1.08,
            letterSpacing: 1.2,
            fontSize: 12,
            color:"#231f20"
          },
          preheader_text: {
            left: 17,
            top: 86,
            width: 266,
            height: 21,
            lineHeight: 1.15,
            letterSpacing: 0.65,
            fontSize: 13
          },
          headline_text: {
            left: 17,
            top: 115,
            width: 266,
            height: 54,
            lineHeight: 0.97,
            letterSpacing: -0.36,
            marginTop: 8,
            fontSize: 36
          },
          subhead_text: {
            left: 17,
            top: 175,
            width: 266,
            height: 27,
            lineHeight: 1.14,
            letterSpacing: -0.14,
            marginTop: 6,
            fontSize: 14
          },
          logo_img: {
            left: 66,
            top: 29,
            width: 168,
            height: 26
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 300,
            height: 215
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: wTemp,
            height: 215
          },
          cta_color: {
            left: 90,
            top: 548,
            width: 120,
            height: 30,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 61,
            top: 69,
            width: 179,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 270,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 280,
            height: 565,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 114,
            top: 526,
            width: 74,
            height: 9,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 44,
            top: 231,
            width: 213,
            height: 213
          },
          nDotActive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDotInactive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDots: {
            spacing: 4
          },
          catImg: {
            width: 213,
            height: 213
          },
          cat_text: {
            left: 43,
            top: 449,
            width: 214,
            height: 32,
            lineHeight: 1.17,
            letterSpacing: 0.18,
            fontSize: 12
          },
          price_text: {
            left: 43,
            top: 488,
            width: 214,
            height: 23,
            marginTop: 7,
            lineHeight: 1,
            fontSize: 16
          },
          rotatorFade: {
            width: 213,
            height: 213
          }
        },
        s300x250: {
          size: {
            width: 300,
            height: 250
          },
          details_text: {
            left: 217,
            top: 237,
            width: 76,
            height: 10,
            lineHeight: 1,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 29,
            top: 206,
            width: 92,
            height: 18,
            lineHeight: 1.08,
            letterSpacing: 1.2,
            fontSize: 12,
            color:"#FFFFFF"
          },
          preheader_text: {
            left: 10,
            top: 64,
            width: 130,
            height: 20,
            lineHeight: 1.27,
            letterSpacing: 0.55,
            fontSize: 11
          },
          headline_text: {
            left: 10,
            top: 90,
            width: 130,
            height: 59,
            lineHeight: 0.96,
            letterSpacing: 0,
            marginTop: 6,
            fontSize: 26
          },
          subhead_text: {
            left: 10,
            top: 154,
            width: 130,
            height: 35,
            lineHeight: 1.17,
            letterSpacing: 0,
            marginTop: 5,
            fontSize: 12
          },
          logo_img: {
            left: 19,
            top: 23,
            width: 111,
            height: 17
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 150,
            height: 250
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 150,
            height: hTemp
          },
          cta_color: {
            left: 23,
            top: 198,
            width: 104,
            height: 31,
            borderColor: "#FFFFFF"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 16,
            top: 52,
            width: 118,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 270,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 280,
            height: 215,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 197,
            top: 223,
            width: 57,
            height: 7,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 161,
            top: 24,
            width: 128,
            height: 128
          },
          nDotActive: {
            borderRadius: 3.5,
            width: 7,
            height: 7
          },
          nDotInactive: {
            borderRadius: 3.5,
            width: 7,
            height: 7
          },
          nDots: {
            spacing: 3
          },
          catImg: {
            width: 128,
            height: 128
          },
          cat_text: {
            left: 160,
            top: 158,
            width: 130,
            height: 31,
            lineHeight: 1.18,
            letterSpacing: 0,
            fontSize: 11
          },
          price_text: {
            left: 160,
            top: 194,
            width: 130,
            height: 20,
            marginTop: 5,
            lineHeight: 1.15,
            fontSize: 13
          },
          rotatorFade: {
            width: 128,
            height: 128
          }
        },
        s800x250: {
          size: {
            width: 800,
            height: 250
          },
          details_text: {
            left: 712,
            top: 235,
            width: 82,
            height: 11,
            lineHeight: 1,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 655,
            top: 187,
            width: 112,
            height: 18,
            lineHeight: 0.93,
            letterSpacing: 1.4,
            fontSize: 14,
            color:"#231f20"
          },
          preheader_text: {
            left: 19,
            top: 89,
            width: 362,
            height: 21,
            lineHeight: 1.13,
            letterSpacing: 0.8,
            fontSize: 16
          },
          headline_text: {
            left: 19,
            top: 118,
            width: 362,
            height: 74,
            lineHeight: 0.98,
            letterSpacing: 0,
            marginTop: 8,
            fontSize: 44
          },
          subhead_text: {
            left: 19,
            top: 198,
            width: 362,
            height: 27,
            lineHeight: 1.14,
            letterSpacing: -0.14,
            marginTop: 6,
            fontSize: 14
          },
          logo_img: {
            left: 112,
            top: 35,
            width: 175,
            height: 27
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 400,
            height: 250
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 400,
            height: hTemp
          },
          cta_color: {
            left: 648,
            top: 177,
            width: 126,
            height: 34,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 107,
            top: 77,
            width: 186,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 770,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 780,
            height: 215,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 669,
            top: 156,
            width: 80,
            height: 10,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 421,
            top: 25,
            width: 200,
            height: 200
          },
          nDotActive: {
            borderRadius: 5,
            width: 10,
            height: 10
          },
          nDotInactive: {
            borderRadius: 5,
            width: 10,
            height: 10
          },
          nDots: {
            spacing: 4
          },
          catImg: {
            width: 200,
            height: 200
          },
          cat_text: {
            left: 640,
            top: 51,
            width: 142,
            height: 57,
            lineHeight: 1.14,
            letterSpacing: 0,
            fontSize: 14
          },
          price_text: {
            left: 640,
            top: 115,
            width: 142,
            height: 23,
            marginTop: 7,
            lineHeight: .83,
            fontSize: 18
          },
          rotatorFade: {
            width: 200,
            height: 200
          }
        },
        s300x1050: {
          size: {
            width: 300,
            height: 1050
          },
          details_text: {
            left: 199,
            top: 1033,
            width: 94,
            height: 14,
            lineHeight: 1.11,
            letterSpacing: 0.225,
            fontSize: 9
          },
          cta_text: {
            left: 71,
            top: 931,
            width: 159,
            height: 26,
            lineHeight: 1.12,
            letterSpacing: 1.7,
            fontSize: 17,
            color:"#231f20"
          },
          preheader_text: {
            left: 28,
            top: 136,
            width: 244,
            height: 41,
            lineHeight: 1.1,
            letterSpacing: 1,
            fontSize: 20
          },
          headline_text: {
            left: 28,
            top: 187,
            width: 244,
            height: 124,
            lineHeight: 0.98,
            letterSpacing: 0,
            marginTop: 10,
            fontSize: 50
          },
          subhead_text: {
            left: 28,
            top: 317,
            width: 244,
            height: 46,
            lineHeight: 1.13,
            letterSpacing: 0,
            marginTop: 6,
            fontSize: 16
          },
          logo_img: {
            left: 60,
            top: 50,
            width: 181,
            height: 28
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 300,
            height: 391
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: wTemp,
            height: 391
          },
          cta_color: {
            left: 65,
            top: 920,
            width: 170,
            height: 43,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 54,
            top: 96,
            width: 192,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 270,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 280,
            height: 1015,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 106,
            top: 889,
            width: 91,
            height: 11,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 15,
            top: 441,
            width: 270,
            height: 270
          },
          nDotActive: {
            borderRadius: 5.5,
            width: 11,
            height: 11
          },
          nDotInactive: {
            borderRadius: 5.5,
            width: 11,
            height: 11
          },
          nDots: {
            spacing: 5
          },
          catImg: {
            width: 270,
            height: 270
          },
          cat_text: {
            left: 30,
            top: 719,
            width: 240,
            height: 72,
            lineHeight: 1.12,
            letterSpacing: 0.255,
            fontSize: 17
          },
          price_text: {
            left: 30,
            top: 800,
            width: 240,
            height: 36,
            marginTop: 9,
            lineHeight: 1.0,
            fontSize: 20
          },
          rotatorFade: {
            width: 270,
            height: 270
          }
        },
        s336x280: {
          size: {
            width: 336,
            height: 280
          },
          details_text: {
            left: 254,
            top: 267,
            width: 76,
            height: 10,
            lineHeight: 1,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 37,
            top: 230,
            width: 95,
            height: 19,
            lineHeight: 1.08,
            letterSpacing: 1.3,
            fontSize: 13,
            color:"#FFFFFF"
          },
          preheader_text: {
            left: 16,
            top: 71,
            width: 136,
            height: 26,
            lineHeight: 1.23,
            letterSpacing: 0.65,
            fontSize: 13
          },
          headline_text: {
            left: 16,
            top: 103,
            width: 136,
            height: 69,
            lineHeight: 0.97,
            letterSpacing: 0,
            marginTop: 6,
            fontSize: 29
          },
          subhead_text: {
            left: 16,
            top: 177,
            width: 136,
            height: 35,
            lineHeight: 1.17,
            letterSpacing: 0,
            marginTop: 5,
            fontSize: 12
          },
          logo_img: {
            left: 27,
            top: 27,
            width: 115,
            height: 18
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 168,
            height: 280
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 168,
            height: hTemp
          },
          cta_color: {
            left: 27,
            top: 222,
            width: 114,
            height: 32,
            borderColor: "#FFFFFF"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 23,
            top: 58,
            width: 122,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 306,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 316,
            height: 245,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 221,
            top: 249,
            width: 63,
            height: 8,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 177,
            top: 24,
            width: 150,
            height: 150
          },
          nDotActive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDotInactive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDots: {
            spacing: 3
          },
          catImg: {
            width: 150,
            height: 150
          },
          cat_text: {
            left: 177,
            top: 180,
            width: 150,
            height: 35,
            lineHeight: 1.18,
            letterSpacing: 0,
            fontSize: 11
          },
          price_text: {
            left: 177,
            top: 220,
            width: 150,
            height: 21,
            marginTop: 5,
            lineHeight: 1.14,
            fontSize: 14
          },
          rotatorFade: {
            width: 150,
            height: 150
          }
        },
        s320x480: {
          size: {
            width: 320,
            height: 480
          },
          details_text: {
            left: -45,
            top: 462,
            width: 78,
            height: 16,
            lineHeight: 1.25,
            letterSpacing: 0.2,
            fontSize: 8
          },
          cta_text: {
            left: 104,
            top: 442,
            width: 112,
            height: 18,
            lineHeight: 1.08,
            letterSpacing: 1.2,
            fontSize: 12,
            color:"#231f20"
          },
          preheader_text: {
            left: 23,
            top: 69,
            width: 274,
            height: 19,
            lineHeight: 1.08,
            letterSpacing: 0.6,
            fontSize: 12
          },
          headline_text: {
            left: 23,
            top: 93,
            width: 274,
            height: 46,
            lineHeight: 0.97,
            letterSpacing: 0,
            marginTop: 5,
            fontSize: 34
          },
          subhead_text: {
            left: 23,
            top: 142,
            width: 274,
            height: 20,
            lineHeight: 1.33,
            letterSpacing: -0.12,
            marginTop: 3,
            fontSize: 12
          },
          logo_img: {
            left: 89,
            top: 24,
            width: 142,
            height: 22
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 320,
            height: 171
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: wTemp,
            height: 171
          },
          cta_color: {
            left: 100,
            top: 435,
            width: 120,
            height: 28,
            borderColor: "#231f20"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 82,
            top: 58,
            width: 157,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 290,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 300,
            height: 445,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 127,
            top: 419,
            width: 68,
            height: 8,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 70,
            top: 182,
            width: 180,
            height: 180
          },
          nDotActive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDotInactive: {
            borderRadius: 4,
            width: 8,
            height: 8
          },
          nDots: {
            spacing: 4
          },
          catImg: {
            width: 180,
            height: 180
          },
          cat_text: {
            left: 52,
            top: 367,
            width: 216,
            height: 39,
            lineHeight: 1.17,
            letterSpacing: 0.18,
            fontSize: 12
          },
          rotatorFade: {
            width: 180,
            height: 180
          }
        },
        s320x50: {
          size: {
            width: 320,
            height: 50
          },
          details_text: {
            left: 295,
            top: 39,
            width: 22,
            height: 9,
            lineHeight: 1,
            letterSpacing: 0.15002775192261,
            fontSize: 6
          },
          headline_text: {
            left: 96,
            top: 7,
            width: 116,
            height: 38,
            lineHeight: 1,
            letterSpacing: -0.16,
            marginTop: 0,
            fontSize: 16
          },
          logo_img: {
            left: 12,
            top: 20,
            width: 65,
            height: 10
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 220,
            height: 50
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 220,
            height: hTemp
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 87,
            top: 9,
            width: 1,
            height: 32
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 290,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 300,
            height: 15,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 226,
            top: 2,
            width: 6,
            height: 46,
            direction: "vertical"
          },
          rotatorFadeContainer: {
            left: 247,
            top: 2,
            width: 46,
            height: 46
          },
          nDotActive: {
            borderRadius: 3,
            width: 6,
            height: 6
          },
          nDotInactive: {
            borderRadius: 3,
            width: 6,
            height: 6
          },
          nDots: {
            spacing: 2
          },
          catImg: {
            width: 46,
            height: 46
          },
          rotatorFade: {
            width: 46,
            height: 46
          }
        },
        s320x100: {
          size: {
            width: 300,
            height: 100
          },
          details_text: {
            left: 294,
            top: 90,
            width: 22,
            height: 9,
            lineHeight: 1,
            letterSpacing: 0.15002775192261,
            fontSize: 6
          },
          headline_text: {
            left: 16,
            top: 42,
            width: 168,
            height: 30,
            lineHeight: 1,
            letterSpacing: -0.19,
            marginTop: 0,
            fontSize: 19
          },
          subhead_text: {
            left: 16,
            top: 74,
            width: 168,
            height: 17,
            lineHeight: 1.22,
            letterSpacing: -0.09,
            marginTop: 2,
            fontSize: 9
          },
          logo_img: {
            left: 64,
            top: 15,
            width: 75,
            height: 12
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 199,
            height: 100
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 199,
            height: hTemp
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 62,
            top: 35,
            width: 80,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 290,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 300,
            height: 65,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 205,
            top: 24,
            width: 6,
            height: 51,
            direction: "vertical"
          },
          rotatorFadeContainer: {
            left: 222,
            top: 12,
            width: 75,
            height: 75
          },
          nDotActive: {
            borderRadius: 3,
            width: 6,
            height: 6
          },
          nDotInactive: {
            borderRadius: 3,
            width: 6,
            height: 6
          },
          nDots: {
            spacing: 3
          },
          catImg: {
            width: 75,
            height: 75
          },
          rotatorFade: {
            width: 75,
            height: 75
          }
        },
        s468x60: {
          size: {
            width: 468,
            height: 60
          },
          details_text: {
            left: 427,
            top: 49,
            width: 38,
            height: 9,
            lineHeight: 0.86,
            letterSpacing: 0.17503249645233,
            fontSize: 7
          },
          headline_text: {
            left: 131,
            top: 5,
            width: 178,
            height: 32,
            lineHeight: 1,
            letterSpacing: -0.2,
            marginTop: 0,
            fontSize: 20
          },
          subhead_text: {
            left: 131,
            top: 39,
            width: 178,
            height: 18,
            lineHeight: 1.2,
            letterSpacing: -0.1,
            marginTop: 2,
            fontSize: 10
          },
          logo_img: {
            left: 14,
            top: 23,
            width: 91,
            height: 14
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 320,
            height: 60
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 320,
            height: hTemp
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 118,
            top: 10,
            width: 1,
            height: 40
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 438,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 448,
            height: 25,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 328,
            top: 5,
            width: 6,
            height: 51,
            direction: "vertical"
          },
          rotatorFadeContainer: {
            left: 366,
            top: 2,
            width: 56,
            height: 56
          },
          nDotActive: {
            borderRadius: 3,
            width: 6,
            height: 6,
          },
          nDotInactive: {
            borderRadius: 3,
            width: 6,
            height: 6
          },
          nDots: {
            spacing: 3
          },
          catImg: {
            width: 56,
            height: 56
          },
          rotatorFade: {
            width: 56,
            height: 56
          }
        },
        s180x150: {
          size: {
            width: 180,
            height: 150
          },
          details_text: {
            left: 134,
            top: 138,
            width: 41,
            height: 10,
            lineHeight: 1.14,
            letterSpacing: 0.175,
            fontSize: 7
          },
          cta_text: {
            left: 15,
            top: 114,
            width: 60,
            height: 13,
            lineHeight: 1.13,
            letterSpacing: 0.8,
            fontSize: 8,
            color:"#FFFFFF"
          },
          headline_text: {
            left: 5,
            top: 50,
            width: 80,
            height: 55,
            lineHeight: 1,
            letterSpacing: -0.18,
            marginTop: 0,
            fontSize: 18
          },
          logo_img: {
            left: 8,
            top: 23,
            width: 74,
            height: 11
          },
          lifestyle_img: {
            left: 0,
            top: 0,
            width: 90,
            height: 150
          },
          bg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          copy_block_color: {
            left: 0,
            top: 0,
            width: 90,
            height: hTemp
          },
          cta_color: {
            left: 12,
            top: 109,
            width: 66,
            height: 21,
            borderColor: "#FFFFFF"
          },
          bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          fg_img: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          style_img: {
            left: 7,
            top: 42,
            width: 76,
            height: 1
          },
          legalTextContainer: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          legal_closeX: {
            left: 10,
            top: 10,
            width: 13,
            height: 13,
            fontSize: 12
          },
          legal_close: {
            left: 26,
            top: 10,
            width: 150,
            height: 14,
            fontSize: 12
          },
          legal_text: {
            left: 10,
            top: 25,
            width: 160,
            height: 115,
            fontSize: 12,
            minFontSize: 12
          },
          legal_text_bg_color: {
            left: 0,
            top: 0,
            width: width,
            height: height
          },
          nDotsContainer: {
            left: 105,
            top: 121,
            width: 62,
            height: 7,
            direction: "horizontal"
          },
          rotatorFadeContainer: {
            left: 96,
            top: 36,
            width: 78,
            height: 78
          },
          nDotActive: {
            borderRadius: 3.5,
            width: 7,
            height: 7
          },
          nDotInactive: {
            borderRadius: 3.5,
            width: 7,
            height: 7
          },
          nDots: {
            spacing: 4
          },
          catImg: {
            width: 78,
            height: 78
          },
          rotatorFade: {
            width: 78,
            height: 78
          }
        }
      };



      var dataArray = [adObj.s970x250, adObj.s320x50, adObj.s728x90, adObj.s300x600, adObj.s300x1050, adObj.s160x600, adObj.s300x250, adObj.s320x480, adObj.s800x250];

      currRatioFloat = height / width;
      findClosestFloat(currRatioFloat, floatArray)

      updateCurrFloat();
      // console.group("DATA");
      // console.log("closest: ", findClosestFloat(currRatioFloat, floatArray));
      // console.log("dimArr: ", dimArray[arrVal]);
      // console.table(dataArray[arrVal]);
      // console.groupEnd("DATA");


      var obj = dataArray[arrVal];

      if (width > 300 && arrVal === 6) {
        obj = adObj.s336x280;
      }
      if (width < 300 && arrVal === 6) {
        obj = adObj.s180x150;
      }
      if (width < 469 && arrVal === 2) {
        obj = adObj.s468x60;
      }
      if (width < 321 && arrVal === 8 ) {
        obj = adObj.s320x100;
      }
      if (wTemp > 320 && arrVal === 1 ) {
        obj = adObj.s728x90;
      }
      if (width === 300 && height === 1050 ) {
        obj = adObj.s300x1050;
      }


      var ctaText = {};
      var detailsText = {};
      var preheaderText = {};
      var headlineText = {};
      var subheadText = {};
      var ctaColor = {};
      var copyBlockColor = {};
      var logoImg = {};
      var lifestyleImg = {};
      var bgImg = {};
      var styleImg = {};
      var rotFadeCont = {};
      var rotFade = {};
      var nDotsCont = {};
      var nDotOn = {};
      var nDotOff = {};
      var nDot = {};
      var catImage = {};
      var catText = {};
      var priceText = {};
      var legalTextCont = {};
      var legalText = {};
      var legalTextBgColor = {};
      var legalCloseX = {};
      var legalClose = {};


      var mW = width/wX;
      var mH = height/hX;

      function updateAd(obj) {

        if (obj.details_text) {
          detailsText.left = Math.floor(obj.details_text.left * mW);
          detailsText.top = Math.floor(obj.details_text.top * mH);
          detailsText.width = Math.floor(obj.details_text.width * mW);
          detailsText.height = Math.floor(obj.details_text.height * mH);
          detailsText.lineHeight = obj.details_text.lineHeight;
          detailsText.letterSpacing = obj.details_text.letterSpacing;
          detailsText.fontSize = Math.floor(obj.details_text.fontSize * mH);
        }

        if (obj.cta_color) {
          ctaText.left = Math.floor(obj.cta_text.left * mW);
          ctaText.top = Math.floor(obj.cta_text.top * mH);
          ctaText.width = Math.floor(obj.cta_text.width * mW);
          ctaText.height = Math.floor(obj.cta_text.height * mH);

          ctaText.lineHeight = obj.cta_text.lineHeight;
          ctaText.letterSpacing = obj.cta_text.letterSpacing;
          ctaText.fontSize = Math.floor(obj.cta_text.fontSize * mH);
          ctaText.color = obj.cta_text.color;
        }

        if (obj.preheader_text) {
          preheaderText.left = Math.floor(obj.preheader_text.left * mW);
          preheaderText.top = Math.floor(obj.preheader_text.top * mH);
          preheaderText.width = Math.floor(obj.preheader_text.width * mW);
          preheaderText.height = Math.floor(obj.preheader_text.height * mH);
          preheaderText.lineHeight = obj.preheader_text.lineHeight;
          preheaderText.letterSpacing = obj.preheader_text.letterSpacing;
          preheaderText.fontSize = Math.floor(obj.preheader_text.fontSize * mH);
        }


        if (obj.logo_img) {
          logoImg.left = Math.floor(obj.logo_img.left * mW);
          logoImg.top = Math.floor(obj.logo_img.top * mH);
          logoImg.width = Math.floor(obj.logo_img.width * mW);
          logoImg.height = Math.floor(obj.logo_img.height * mH);
        }


        if (obj.style_img) {
          styleImg.left = Math.ceil(obj.style_img.left * mW);
          styleImg.top = Math.ceil(obj.style_img.top * mH);
          styleImg.width = Math.ceil(obj.style_img.width * mW);
          styleImg.height = Math.ceil(obj.style_img.height * mH);
           console.log("SI height: " + styleImg.height + " width: " + styleImg.width + " left: " + styleImg.left + " top: " + styleImg.top)
        }


        if (obj.headline_text) {

          headlineText.left = Math.floor(obj.headline_text.left * mW);
          headlineText.top = Math.floor(obj.headline_text.top * mH);
          headlineText.width = Math.floor(obj.headline_text.width * mW);
          headlineText.height = Math.floor(obj.headline_text.height * mH);

          headlineText.lineHeight = obj.headline_text.lineHeight;
          headlineText.letterSpacing = obj.headline_text.letterSpacing;
          headlineText.marginTop = Math.floor(obj.headline_text.marginTop * mH);
          headlineText.fontSize = Math.floor(obj.headline_text.fontSize * mH);
        }

        if (obj.subhead_text) {
          subheadText.left = Math.floor(obj.subhead_text.left * mW);
          subheadText.top = Math.floor(obj.subhead_text.top * mH);
          subheadText.width = Math.floor(obj.subhead_text.width * mW);
          subheadText.height = Math.floor(obj.subhead_text.height * mH);
          subheadText.lineHeight = obj.subhead_text.lineHeight;
          subheadText.letterSpacing = obj.subhead_text.letterSpacing;
          subheadText.marginTop = Math.floor(obj.subhead_text.marginTop * mH);
          subheadText.fontSize = Math.floor(obj.subhead_text.fontSize * mH);
        }

        if (obj.cta_color) {
          ctaColor.left = Math.floor(obj.cta_color.left * mW);
          ctaColor.top = Math.floor(obj.cta_color.top * mH);
          ctaColor.width = Math.floor(obj.cta_color.width * mW);
          ctaColor.height = Math.floor(obj.cta_color.height * mH);
          ctaColor.borderColor = obj.cta_color.borderColor;
        }

        if (obj.logo_img) {
          logoImg.left = Math.floor(obj.logo_img.left * mW);
          logoImg.top = Math.floor(obj.logo_img.top * mH);
          logoImg.width = Math.floor(obj.logo_img.width * mW);
          logoImg.height = Math.floor(obj.logo_img.height * mH);
        }


        if (obj.lifestyle_img) {
          lifestyleImg.left = Math.floor(obj.lifestyle_img.left * mW);
          lifestyleImg.top = Math.floor(obj.lifestyle_img.top * mH);
          lifestyleImg.width = Math.floor(obj.lifestyle_img.width * mW);
          lifestyleImg.height = Math.floor(obj.lifestyle_img.height * mH);
        }

        if (obj.bg_img) {
          bgImg.left = obj.bg_img.left;
          bgImg.top = obj.bg_img.top;
          bgImg.width = obj.bg_img.width;
          bgImg.height = obj.bg_img.height;
        }

        if (obj.copy_block_color) {
          copyBlockColor.left = Math.floor(obj.copy_block_color.left * mW);
          copyBlockColor.top = Math.floor(obj.copy_block_color.top * mH);
          // have to test whether or not it's vert/horz to tell it which way to stretch 100%
          if (obj.copy_block_color.width === width){
            copyBlockColor.width = "100%";
            copyBlockColor.height = Math.floor(obj.copy_block_color.height * mH);
          } else {
            copyBlockColor.width = Math.floor(obj.copy_block_color.width * mW);
            copyBlockColor.height = "100%";
          }
        }

        if(obj.nDotsContainer) {
          nDotsCont.left = Math.floor(obj.nDotsContainer.left * mW);
          nDotsCont.top = Math.floor(obj.nDotsContainer.top * mH);
          nDotsCont.width = Math.floor(obj.nDotsContainer.width * mW);
          nDotsCont.height = Math.floor(obj.nDotsContainer.height * mH);
          nDotsCont.direction = obj.nDotsContainer.direction;
        }

        if(obj.rotatorFadeContainer) {
          rotFadeCont.left = Math.floor(obj.rotatorFadeContainer.left * mW);
          rotFadeCont.top = Math.floor(obj.rotatorFadeContainer.top * mH);
          rotFadeCont.width = Math.floor(obj.rotatorFadeContainer.width * mW);
          rotFadeCont.height = Math.floor(obj.rotatorFadeContainer.height * mH);

          rotFade.width = Math.floor(obj.rotatorFade.width * mW);
          rotFade.height = Math.floor(obj.rotatorFade.height * mH);

          catImage.width = "100%";
          catImage.height = "100%";
        }

        if (obj.cat_text) {
          catText.left = Math.floor(obj.cat_text.left * mW);
          catText.top = Math.floor(obj.cat_text.top * mH);
          catText.width = Math.floor(obj.cat_text.width * mW);
          catText.height = Math.floor(obj.cat_text.height * mH);
          catText.lineHeight = obj.cat_text.lineHeight;
          catText.letterSpacing = obj.cat_text.letterSpacing;
          catText.fontSize = Math.floor(obj.cat_text.fontSize * mH);
        }

        if (obj.price_text) {
          priceText.left = Math.floor(obj.price_text.left * mW);
          priceText.top = Math.floor(obj.price_text.top * mH);
          priceText.width = Math.floor(obj.price_text.width * mW);
          priceText.height = Math.floor(obj.price_text.height * mH);
          priceText.lineHeight = obj.price_text.lineHeight;
          priceText.marginTop = Math.floor(obj.price_text.marginTop * mH);
          priceText.fontSize = Math.floor(obj.price_text.fontSize * mH);
        }

        if (obj.nDotActive) {
          nDotOn.borderRadius = Math.floor(obj.nDotActive.borderRadius * mW);
          nDotOn.width = Math.floor(obj.nDotActive.width * mW);
          nDotOn.height = Math.floor(obj.nDotActive.height * mW);

          nDotOff.borderRadius = Math.floor(obj.nDotInactive.borderRadius * mW);
          nDotOff.width = Math.floor(obj.nDotInactive.width * mW);
          nDotOff.height = Math.floor(obj.nDotInactive.height * mW);

          nDot.spacing = Math.floor(obj.nDots.spacing * mW);
        }

        if (obj.legalTextContainer) {
          legalTextCont.left = Math.floor(obj.legalTextContainer.left * mW);
          legalTextCont.top = Math.floor(obj.legalTextContainer.top * mH);
          legalTextCont.width = Math.floor(obj.legalTextContainer.width * mW);
          legalTextCont.height = Math.floor(obj.legalTextContainer.height * mH);

          legalCloseX.left = Math.floor(obj.legal_closeX.left * mW);
          legalCloseX.top = Math.floor(obj.legal_closeX.top * mH);
          legalCloseX.width = Math.floor(obj.legal_closeX.width * mW);
          legalCloseX.height = Math.floor(obj.legal_closeX.height * mH);
          legalCloseX.fontSize = Math.floor(obj.legal_closeX.fontSize * mH);

          legalClose.left = Math.floor(obj.legal_close.left * mW);
          legalClose.top = Math.floor(obj.legal_close.top * mH);
          legalClose.width = Math.floor(obj.legal_close.width * mW);
          legalClose.height = Math.floor(obj.legal_close.height * mH);
          legalClose.fontSize = Math.floor(obj.legal_close.fontSize * mH);

          legalText.left = Math.floor(obj.legal_text.left * mW);
          legalText.top = Math.floor(obj.legal_text.top * mH);
          legalText.width = Math.floor(obj.legal_text.width * mW);
          legalText.height = Math.floor(obj.legal_text.height * mH);
          legalText.fontSize = Math.floor(obj.legal_text.fontSize * mH);
          legalText.minFontSize = obj.legal_text.minFontSize;

          legalTextBgColor.left = Math.floor(obj.legal_text_bg_color.left * mW);
          legalTextBgColor.top = Math.floor(obj.legal_text_bg_color.top * mH);
          legalTextBgColor.width = Math.floor(obj.legal_text_bg_color.width * mW);
          legalTextBgColor.height = Math.floor(obj.legal_text_bg_color.height * mH);
        }

      }

      updateAd(obj);

      console.log("size: " + width + "x" + height);


      if (obj.details_text) {
        var details_text = R.create("div").set({
          css: {
            color: R.create("var").set({
              name: "details_text_color",
              defaultValue: "#000000",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            fontSize: detailsText.fontSize,
            fontFamily: 11435,
            fontStyle: "Light",
            lineHeight: detailsText.lineHeight,
            letterSpacing: detailsText.letterSpacing,
            textAlign: "right",
            verticalAlign: "middle",
            marginTop: 0,
            backgroundColor: R.create("var").set({
              name: "details_text_bg_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            padding: R.create("var").set({
              name: "details_text_padding",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            left: detailsText.left,
            top: detailsText.top,
            width: detailsText.width,
            height: detailsText.height,
            zIndex: 1000,
            pointerEvents: "auto",
            cursor: "pointer",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage, pixelDensity: FOF_PIXEL_DENSITY, forceLineHeight: true
          },
          attr: {
            id: "details_text",
            textContent: R.create("var").set({
              name: "details_text",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value()
          }
          }).render().on("click", displayLegal);
      }

      if (obj.cta_text) {
        var cta_text = R.create("div").set({
          css: {
            color: R.create("var").set({
              name: "cta_text_color",
              defaultValue: ctaText.color,
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            fontSize: ctaText.fontSize,
            fontFamily: 11442,
            fontStyle: "Family",
            lineHeight: ctaText.lineHeight,
            letterSpacing: ctaText.letterSpacing,
            textAlign: "center",
            verticalAlign: "middle",
            marginTop: 0,
            backgroundColor: R.create("var").set({
              name: "cta_text_bg_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            padding: R.create("var").set({
              name: "cta_text_padding",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            left: ctaText.left,
            top: ctaText.top,
            width: ctaText.width,
            height: ctaText.height,
            zIndex: 474,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage, pixelDensity: FOF_PIXEL_DENSITY, forceLineHeight: true
          },
          attr: {
            id: "cta_text",
            textContent: R.create("var").set({
              name: "cta_text",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value()
          }
        }).render();
      }

      if (obj.preheader_text) {
        var preheader_text = R.create("div").set({
          css: {
            color: R.create("var").set({
              name: "preheader_text_color",
              defaultValue: "#000000",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            fontSize: preheaderText.fontSize,
            fontFamily: 11435,
            fontStyle: "Light",
            lineHeight: preheaderText.lineHeight,
            letterSpacing: preheaderText.letterSpacing,
            textAlign: "center",
            verticalAlign: "middle",
            marginTop: 0,
            backgroundColor: R.create("var").set({
              name: "preheader_text_bg_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            padding: R.create("var").set({
              name: "preheader_text_padding",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            left: preheaderText.left,
            top: preheaderText.top,
            width: preheaderText.width,
            height: preheaderText.height,
            zIndex: 102,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage, pixelDensity: FOF_PIXEL_DENSITY, forceLineHeight: true
          },
          attr: {
            id: "preheader_text",
            textContent: R.create("var").set({
              name: "preheader_text",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value()
          }
        });
      }

      if (obj.headline_text) {
        var headline_text = R.create("div").set({
          css: {
            color: R.create("var").set({
              name: "headline_text_color",
              defaultValue: "#000000",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            fontSize: headlineText.fontSize,
            fontFamily: 11435,
            fontStyle: "Light",
            lineHeight: headlineText.lineHeight,
            letterSpacing: headlineText.letterSpacing,
            textAlign: "center",
            verticalAlign: "middle",
            marginTop: headlineText.marginTop,
            backgroundColor: R.create("var").set({
              name: "headline_text_bg_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            padding: R.create("var").set({
              name: "headline_text_padding",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            left: headlineText.left,
            top: headlineText.top,
            width: headlineText.width,
            height: headlineText.height,
            zIndex: 101,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage, pixelDensity: FOF_PIXEL_DENSITY, forceLineHeight: true
          },
          attr: {
            id: "headline_text",
            textContent: R.create("var").set({
              name: "headline_text",
              defaultValue: "",
              dataType: "String",
              required: true,
              exposed: true
            }).render().value()
          }
        });
      }

      if (obj.subhead_text) {
        var subhead_text = R.create("div").set({
          css: {
            color: R.create("var").set({
              name: "subhead_text_color",
              defaultValue: "#000000",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            fontSize: subheadText.fontSize,
            fontFamily: 11442,
            fontStyle: "Family",
            lineHeight: subheadText.lineHeight,
            letterSpacing: subheadText.letterSpacing,
            textAlign: "center",
            verticalAlign: "middle",
            marginTop: subheadText.marginTop,
            backgroundColor: R.create("var").set({
              name: "subhead_text_bg_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            padding: R.create("var").set({
              name: "subhead_text_padding",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            left: subheadText.left,
            top: subheadText.top,
            width: subheadText.width,
            height: subheadText.height,
            zIndex: 100,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage, pixelDensity: FOF_PIXEL_DENSITY, forceLineHeight: true
          },
          attr: {
            id: "subhead_text",
            textContent: R.create("var").set({
              name: "subhead_text",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value()
          }
        });
      }

      if (obj.cta_color) {
        var cta_color = R.create("div").set({
          css: {
            left: ctaColor.left,
            top: ctaColor.top,
            zIndex: 141,
            width: ctaColor.width,
            height: ctaColor.height,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            backgroundColor: R.create("var").set({
              name: "cta_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            borderRadius: 0,
            border: R.create("var").set({
              name: "cta_border",
              defaultValue: "1px solid " + ctaColor.borderColor,
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage
          },
          attr: {
            id: "cta_color"
          }
        }).render();

      }

      if (obj.copy_block_color) {
        var copy_block_color = R.create("div").set({
          css: {
            left: copyBlockColor.left,
            top: copyBlockColor.top,
            zIndex: 84,
            width: copyBlockColor.width,
            height: copyBlockColor.height,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            backgroundColor: R.create("var").set({
              name: "copy_block_color",
              defaultValue: "rgba(0,127,112,0.5)",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            borderRadius: 0,
            border: R.create("var").set({
              name: "copy_block_border",
              defaultValue: "0px solid rgba(undefined,0.5)",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage
          },
          attr: {
            id: "copy_block_color"
          }
        }).render();
      }

      var bg_color = R.create("div").set({
          css: {
            left: 0,
            top: 0,
            zIndex: 11,
            width: 970,
            height: 250,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            backgroundColor: R.create("var").set({
              name: "bg_color",
              defaultValue: "#ffffff",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value(),
            borderRadius: 0,
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage
          },
          attr: {
            id: "bg_color"
          }
        }).render();

      if (obj.fg_img) {
        var fg_img = R.create("div").set({
          css: {
            backgroundImage: R.create("var").set({
              name: "fg_img",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            backgroundSize: "contain",
            backgroundPosition: "center center",
            left: 0,
            top: 0,
            width: width,
            height: height,
            zIndex: 992,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage,
            tint: R.create("var").set({
              name: "fg_img_tint",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value()
          },
          attr: {
            id: "fg_img"
          }
        }).render();
      }

      if (obj.style_img) {
        var style_img = R.create("div").set({
        css: {
          backgroundImage: R.create("var").set({
            name: "style_img",
            defaultValue: "",
            dataType: "String",
            required: false,
            exposed: true
          }).render().value(),
          backgroundSize: "contain",
          backgroundPosition: "center center",
          left: styleImg.left,
          top: styleImg.top,
          width: styleImg.width,
          height: styleImg.height,
          zIndex: 978,
          pointerEvents: "none",
          cursor: "auto",
          position: "absolute",
          visibility: "hidden"
        },
        rosetta: {
          parentNode: stage,
          tint: R.create("var").set({
            name: "style_img_tint",
            defaultValue: "",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value()
        },
        attr: {
          id: "style_img"
        }
      }).render();
      }

      if (obj.logo_img) {
        var logo_img = R.create("div").set({
          css: {
            backgroundImage: R.create("var").set({
              name: "logo_img",
              defaultValue: "",
              dataType: "String",
              required: true,
              exposed: true
            }).render().value(),
            backgroundSize: "contain",
            backgroundPosition: "center center",
            left: logoImg.left,
            top: logoImg.top,
            width: logoImg.width,
            height: logoImg.height,
            zIndex: 703,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage,
            tint: R.create("var").set({
              name: "logo_img_tint",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value()
          },
          attr: {
            id: "logo_img"
          }
        }).render();
      }

      if (obj.lifestyle_img) {
        var lifestyle_img = R.create("div").set({
          css: {
            backgroundImage: R.create("var").set({
              name: "lifestyle_img",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            backgroundSize: "contain",
            backgroundPosition: "center center",
            left: lifestyleImg.left,
            top: lifestyleImg.top,
            width: lifestyleImg.width,
            height: lifestyleImg.height,
            zIndex: 66,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage,
            tint: R.create("var").set({
              name: "lifestyle_img_tint",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value()
          },
          attr: {
            id: "lifestyle_img"
          }
        }).render();
      }

      if (obj.bg_img) {
        var bg_img = R.create("div").set({
          css: {
            backgroundImage: R.create("var").set({
              name: "bg_img",
              defaultValue: "",
              dataType: "String",
              required: false,
              exposed: true
            }).render().value(),
            backgroundSize: "contain",
            backgroundPosition: "center center",
            left: bgImg.left,
            top: bgImg.top,
            width: bgImg.width,
            height: bgImg.height,
            zIndex: 26,
            pointerEvents: "none",
            cursor: "auto",
            position: "absolute",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage,
            tint: R.create("var").set({
              name: "bg_img_tint",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value()
          },
          attr: {
            id: "bg_img"
          }
        }).render();
      }


      /* [CREATING_COMPONENTS] */
      //LEGAL_TEXT
      var legalTextContainer = R.create("div").set({
        attr: {
          id: "legalTextContainer"
        },
        css: {
          name: "legalTextContainer",
          zIndex: 1001,
          left: legalTextCont.left,
          top: legalTextCont.top,
          width: legalTextCont.width,
          height: legalTextCont.height,
          visibility: "hidden",
          pointerEvents: "auto",
          opacity: 0.5,
          cursor: "pointer"
        },
        rosetta: {
          parentNode: stage,
          data: {
            hitIndex: 0
          }
        }
      }).render();

      var legal_closeX = R.create("div").set({
        attr: {
          id: "legal_closeX",
          textContent: "x"
        },
        css: {
          fontSize: legalCloseX.fontSize,
          fontFamily: "OpenSans, sans-serif",
          textType: "fontFaceText",
          lineHeight: 1,
          letterSpacing: 0,
          left: legalCloseX.left,
          top: legalCloseX.top,
          width: legalCloseX.width,
          height: legalCloseX.height,
          zIndex: 1196,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          borderRadius: "7px",
          backgroundColor: "#FFFFFF",
          color: R.create("var").set({
            name: "legal_text_bg_color",
            defaultValue: "#000000",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          textAlign: "center"
        },
        rosetta: {
          parentNode: legalTextContainer,
          resizeElement: false
        }
      }).render().on("click", displayLegal);

      var legal_close = R.create("div").set({
        attr: {
          id: "legal_close",
          textContent: "close"
        },
        css: {
          fontSize: legalClose.fontSize,
          fontFamily: "OpenSans, sans-serif",
          textType: "fontFaceText",
          lineHeight: 1,
          letterSpacing: 0,
          left: legalClose.left,
          top: legalClose.top,
          width: legalClose.width,
          height: legalClose.height,
          zIndex: 1196,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          color: "#FFFFFF",
          textAlign: "left"
        },
        rosetta: {
          parentNode: legalTextContainer
        }
      }).render().on("click", displayLegal);

      var legal_text = R.create("div").set({
        attr: {
          id: "legal_text",
          textContent: R.create("var").set({
            name: "legal_text",
            defaultValue: "",
            dataType: "String",
            required: false,
            exposed: true
          }).render().value()
        },
        css: {
          fontSize: legalText.fontSize,
          minFontSize: legalText.minFontSize,
          fontFamily: "Arial, Verdana, Helvetica, Sans",
          textType: "fontFaceText",
          lineHeight: 1,
          letterSpacing: 0,
          left: legalText.left,
          top: legalText.top,
          width: legalText.width,
          height: legalText.height,
          zIndex: 1,
          pointerEvents: "auto",
          cursor: "pointer",
          position: "absolute",
          color: R.create("var").set({
            name: "legal_text_color",
            defaultValue: "#FFFFFF",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          textAlign: "left",
          overflowY: "auto",
          overflowWrap: "break-word",
          wordWrap: "break-word",
          wordBreak: "break-word"
        },
        rosetta: {
          parentNode: legalTextContainer,
          resizeElement: false
        }
      }).render().on("click", displayLegal);

      var legal_text_bg_color = R.create("div").set({
        attr: {
          id: "legal_text_bg_color"
        },
        css: {
          name: "legal_text_bg_color",
          zIndex: 0,
          left: legalTextBgColor.left,
          top: legalTextBgColor.top,
          width: legalTextBgColor.width,
          height: legalTextBgColor.height,
          backgroundColor: R.create("var").set({
            name: "legal_text_bg_color",
            defaultValue: "#000000",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          opacity: 0.8,
          cursor: "pointer"
        },
        rosetta: {
          parentNode: legalTextContainer,
          data: {
            hitIndex: 0
          }
        }
      }).render();

      //IF THERE IS NO LEGAL TEXT DISABLE TRIGGER
      if (!legal_text.element.textContent) {
        details_text.element.style.pointerEvents = "none";
      }
      ;

      function displayLegal() {
        console.log("I was licked")
        if (legalTextContainer.element.style.visibility == "hidden") {
          TweenMax.to(legalTextContainer.element, .25, {autoAlpha: 1});
        } else {
          TweenMax.to(legalTextContainer.element, .25, {autoAlpha: 0});
        }
      }

      var cat_textArr = [];
      var price_textArr = [];
      var catImgVarsArr = [
        R.create("var").set({
          name: "cat_img1",
          defaultValue: "",
          dataType: "String",
          required: true,
          exposed: true
        }).render().value(),
        R.create("var").set({
          name: "cat_img2",
          defaultValue: "",
          dataType: "String",
          required: false,
          exposed: true
        }).render().value(),
        R.create("var").set({
          name: "cat_img3",
          defaultValue: "",
          dataType: "String",
          required: false,
          exposed: true
        }).render().value()
      ];
      var catImgsArr = [];

      if (obj.nDotsContainer) {
        var nDotsContainer = R.create("div").set({
          attr: {
            id: "nDotsContainer"
          },
          css: {
            name: "nDotsContainer",
            zIndex: 436,
            left: nDotsCont.left,
            top: nDotsCont.top,
            width: nDotsCont.width,
            height: nDotsCont.height,
            pointerEvents: "none",
            visibility: "hidden"
          },
          rosetta: {
            parentNode: stage
          }
        }).render();
      }

      if (obj.rotatorFadeContainer) {
        var rotatorFadeContainer = R.create("div").set({
          attr: {
            id: "rotatorFadeContainer"
          },
          css: {
            name: "rotatorFadeContainer",
            zIndex: 310,
            left: rotFadeCont.left,
            top: rotFadeCont.top,
            width: rotFadeCont.width,
            height: rotFadeCont.height,
            pointerEvents: "none",
            visibility: "hidden",
            backgroundColor: R.create("var").set({
              name: "rotator_bg_color",
              defaultValue: "",
              dataType: "Color",
              required: false,
              exposed: true
            }).render().value()
          },
          rosetta: {
            parentNode: stage
          }
        }).render();
      }

      /* [NDOTS_ACTIVE_STATES] */

      var nDotActive = R.create("div").set({
        css: {
          backgroundColor: R.create("var").set({
            name: "ndot_on_color",
            defaultValue: "rgba(15,1,41,1)",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          boxShadow: R.create("var").set({
            name: "ndot_on_shadow_color",
            defaultValue: "",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          border: R.create("var").set({
            name: "ndot_on_border",
            defaultValue: "0px solid rgba(255,255,255,1)",
            dataType: "String",
            required: false,
            exposed: true
          }).render().value(),
          borderRadius: nDotOn.borderRadius,
          width: nDotOn.width,
          height: nDotOn.height,
          visibility: "hidden"
        },
        rosetta: {
          id: "nDotActive",
          parentNode: nDotsContainer
        }
      }).render();

      var nDotInactive = R.create("div").set({
        css: {
          backgroundColor: R.create("var").set({
            name: "ndot_off_color",
            defaultValue: "rgba(179,179,179,1)",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          boxShadow: R.create("var").set({
            name: "ndot_off_shadow_color",
            defaultValue: "",
            dataType: "Color",
            required: false,
            exposed: true
          }).render().value(),
          border: R.create("var").set({
            name: "ndot_off_border",
            defaultValue: "0px solid rgba(255,255,255,1)",
            dataType: "String",
            required: false,
            exposed: true
          }).render().value(),
          borderRadius: nDotOff.borderRadius,
          width: nDotOff.width,
          height: nDotOff.height,
          visibility: "hidden"
        },
        rosetta: {
          id: "nDotInactive",
          parentNode: nDotsContainer
        }
      }).render();

      for (var i = 0; i < catImgVarsArr.length; i++) {
        if (obj.catImg) {
          var catImg = R.create("div").set({
            attr: {
              id: "cat_img" + (i + 1)
            },
            css: {
              name: "cat_img" + (i + 1),
              width: catImage.width,
              height: catImage.height,
              backgroundImage: catImgVarsArr[i],
              backgroundSize: "contain",
              backgroundPosition: "center center",
              backgroundColor: R.create("var").set({
                name: "cat_img_bg_color",
                defaultValue: "",
                dataType: "Color",
                required: false,
                exposed: true
              }).render().value(),
              border: R.create("var").set({
                name: "cat_img_border",
                defaultValue: "",
                dataType: "String",
                required: false,
                exposed: true
              }).render().value(),
              borderRadius: R.create("var").set({
                name: "cat_img_radius",
                defaultValue: "",
                dataType: "String",
                required: false,
                exposed: true
              }).render().value(),
              position: "absolute",
              visibility: "hidden",
              cursor: "pointer",
              pointerEvents: "auto"
            },
            rosetta: {
              parentNode: rotatorFadeContainer,
              data: {
                hitIndex: i + 1
              }
            }
          }).render().on("click", adHit);
        }

          var cat_text = R.create("div").set({
            css: {
              color: R.create("var").set({
                name: "cat_text_color",
                defaultValue: "#000000",
                dataType: "Color",
                required: false,
                exposed: true
              }).render().value(),
              fontSize: catText.fontSize,
              fontFamily: 10503,
              fontStyle: "Light",
              lineHeight: catText.lineHeight,
              letterSpacing: catText.letterSpacing,
              textAlign: "center",
              verticalAlign: "middle",
              marginTop: 0,
              backgroundColor: R.create("var").set({
                name: "cat_text_bg_color",
                defaultValue: "",
                dataType: "Color",
                required: false,
                exposed: true
              }).render().value(),
              padding: R.create("var").set({
                name: "cat_text_padding",
                defaultValue: "",
                dataType: "String",
                required: false,
                exposed: true
              }).render().value(),
              left: catText.left,
              top: catText.top,
              width: catText.width,
              height: catText.height,
              zIndex: 1498,
              pointerEvents: "auto",
              cursor: "pointer",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta: {
              parentNode: stage,
              pixelDensity: FOF_PIXEL_DENSITY,
              forceLineHeight: true
            },
            attr: {
              id: "cat_text" + (i + 1),
              textContent: R.create("var").set({
                name: "cat_text" + (i + 1),
                defaultValue: "",
                required: false,
                exposed: true
              }).render().value()
            },
            data: {
              hitIndex: i + 1
            }
          }).on("click", adHit);

          var price_text = R.create("div").set({
            css: {
              color: R.create("var").set({
                name: "price_text_color",
                defaultValue: "#000000",
                dataType: "Color",
                required: false,
                exposed: true
              }).render().value(),
              fontSize: priceText.fontSize,
              fontFamily: 10506,
              fontStyle: "SemiBold",
              lineHeight: priceText.lineHeight,
              letterSpacing: priceText.letterSpacing,
              textAlign: "center",
              verticalAlign: "middle",
              marginTop: priceText.marginTop,
              backgroundColor: R.create("var").set({
                name: "price_text_bg_color",
                defaultValue: "",
                dataType: "Color",
                required: false,
                exposed: true
              }).render().value(),
              padding: R.create("var").set({
                name: "price_text_padding",
                defaultValue: "",
                dataType: "String",
                required: false,
                exposed: true
              }).render().value(),
              left: priceText.left,
              top: priceText.top,
              width: priceText.width,
              height: priceText.height,
              zIndex: 497,
              pointerEvents: "auto",
              cursor: "pointer",
              position: "absolute",
              visibility: "hidden"
            },
            rosetta: {
              parentNode: stage,
              pixelDensity: FOF_PIXEL_DENSITY,
              forceLineHeight: true
            },
            attr: {
              id: "price_text" + (i + 1),
              textContent: R.create("var").set({
                name: "price_text" + (i + 1),
                defaultValue: "",
                required: false,
                exposed: true
              }).render().value()
            },
            data: {
              hitIndex: i + 1
            }
          }).on("click", adHit);

        if (obj.cat_text && obj.price_text) {
          R.create("AlignmentGroup").set({
            verticalAlign: "middle"
          }).add([cat_text, price_text]).render();

          cat_textArr.push(cat_text);
          price_textArr.push(price_text);
          catImgsArr.push(catImg);
        } else if (obj.cat_text && !obj.price_text) {
          cat_textArr.push(cat_text);
          catImgsArr.push(catImg);
        } else {
          catImgsArr.push(catImg);
        }
      }

      var catTextRotator;
      var priceTextRotator;
      var nDots;
      var rotatorFade;

      function startRotator() {
        if (obj.rotatorFade) {
          rotatorFade = R.create("rotatorfade").set({
            id: "rotatorFade",
            container: rotatorFadeContainer,
            crossFade: false,
            width: rotFade.width,
            height: rotFade.height,
            zIndex: 310,
            spacing: 0,
            autoPlay: true,
            clickIndexOffset: 0,
            elements: catImgsArr,
            endOnFirst: true,
            numLoops: 1,
            onDuration: 1.5,
            startIndex: 0,
            transitionDuration: 0.75,
            ease: "Power0.easeNone"
          }).render();
        }

        if (obj.cat_text) {
          catTextRotator = R.create("rotatorfade").set({
            elements: cat_textArr,
            transitionDuration: 0.75,
            onDuration: 1.5,
            autoPlay: false
          }).render();
        }

        if (obj.price_text) {
          priceTextRotator = R.create("rotatorfade").set({
            elements: price_textArr,
            transitionDuration: 0.75,
            onDuration: 1.5,
            autoPlay: false
          }).render();
        }

        nDots = R.create("ndots").set({
          id: "nDots",
          container: nDotsContainer,
          activeElement: nDotActive,
          inactiveElement: nDotInactive,
          spacing: nDot.spacing,
          direction: nDotsCont.direction,
          alignment: "center",
          maxElements: rotatorFade.numElements
        }).render();

        if (obj.price_text && obj.cat_text) {
            catTextRotator.controlledBy = [priceTextRotator, nDots, rotatorFade];
            priceTextRotator.controlledBy = [catTextRotator, nDots, rotatorFade];
            nDots.controlledBy = [catTextRotator, priceTextRotator, rotatorFade];
            rotatorFade.controlledBy = [catTextRotator, priceTextRotator, nDots];
        } else if (obj.cat_text && !obj.price_text) {
          catTextRotator.controlledBy = [nDots, rotatorFade];
          nDots.controlledBy = [catTextRotator, rotatorFade];
          rotatorFade.controlledBy = [catTextRotator, nDots];
        } else {
          nDots.controlledBy = [rotatorFade];
          rotatorFade.controlledBy = [nDots];
        }
      };

      /* [BATCH_LOADING] */
      var requiredArr = [logo_img, headline_text];


      if (obj.preheader_text && obj.subhead_text) {
        var group16Array = [preheader_text, headline_text, subhead_text];
      } else if (!obj.preheader_text) {
        var group16Array = [headline_text, subhead_text];
      }

      var nDotsArr = [nDotActive, nDotInactive];
      var allElementsArr1 = [details_text, cta_text, fg_img, style_img, lifestyle_img, bg_img, cta_color, copy_block_color, bg_color, nDotsContainer, rotatorFadeContainer];
      var allElementsArr2 = [details_text, fg_img, style_img, lifestyle_img, bg_img, copy_block_color, bg_color, nDotsContainer, rotatorFadeContainer];


if (group16Array) {
      var group16 = R.create("AlignmentGroup").set({
        verticalAlign: "middle"
      }).add(group16Array).render();
}

      function additionalSettings() {
        nDotsContainer.element.style.overflow = "";
        for (var i = 0; i < nDotsContainer.element.getElementsByTagName("*").length; i++) {
          nDotsContainer.element.getElementsByTagName("*")[i].style.overflow = "";
        }
      };

      var megaBatch;
      if (obj.cat_text && obj.price_text) {
        megaBatch = R.create("batch")
          .require(requiredArr)
          .add(group16Array)
          .add(nDotsArr)
          .require(catImgsArr, 1)
          .add(cat_textArr)
          .add(price_textArr)
          .add(allElementsArr1)
          .render({
            success: function () {
              hideFailed(R.filter.removeParallel(cat_textArr, price_textArr, catImgsArr, R.filter.parallel(catImgsArr)));
              displayLoaded([
                R.filter.success(requiredArr),
                R.filter.success(group16Array),
                R.filter.success(nDotsArr),
                R.filter.success(catImgsArr),
                R.filter.success(cat_textArr),
                R.filter.success(allElementsArr1)
              ]);
              startRotator();
              additionalSettings();
              creativeReady();
            },
            fail: function (e) {
              R.fallback(e);
            }
          });
      } else if (obj.cat_text && !obj.price_text) {
        megaBatch = R.create("batch")
          .require(requiredArr)
          .add(group16Array)
          .add(nDotsArr)
          .require(catImgsArr, 1)
          .add(cat_textArr)
          .add(allElementsArr1)
          .render({
            success: function () {
              hideFailed(R.filter.removeParallel(cat_textArr, catImgsArr, R.filter.parallel(catImgsArr)));
              displayLoaded([
                R.filter.success(requiredArr),
                R.filter.success(group16Array),
                R.filter.success(nDotsArr),
                R.filter.success(catImgsArr),
                R.filter.success(cat_textArr),
                R.filter.success(allElementsArr1)
              ]);
              startRotator();
              additionalSettings();
              creativeReady();
            },
            fail: function (e) {
              R.fallback(e);
            }
          });
      } else if (!obj.cat_text && !obj.preheader_text && !obj.subhead_text && obj.cta_text)  {
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  ////  180x150
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        var megaBatch = R.create("batch")
          .require(requiredArr)
          .add(nDotsArr)
          .require(catImgsArr, 1)
          .add(allElementsArr1)
          .render({
            success: function(){
              hideFailed(R.filter.removeParallel(catImgsArr,R.filter.parallel(catImgsArr)));
              displayLoaded([
                R.filter.success(requiredArr),
                R.filter.success(nDotsArr),
               R.filter.success(catImgsArr),
               R.filter.success(allElementsArr1)
              ]);
              startRotator();
              additionalSettings();
              creativeReady();
            },
            fail: function(e){
              // console.log(e);
              R.fallback(e);
            }
          });
      } else if (width === 468)  {
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  ////   468x60
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        var megaBatch = R.create("batch")
          .require(requiredArr)
          .add(group16Array)
          .add(nDotsArr)
          .require(catImgsArr, 1)
          .add(allElementsArr2)
          .render({
            success: function(){
              hideFailed(R.filter.removeParallel(catImgsArr,R.filter.parallel(catImgsArr)));
              displayLoaded([
                R.filter.success(requiredArr),
                R.filter.success(group16Array),
                R.filter.success(nDotsArr),
                R.filter.success(catImgsArr),
                R.filter.success(allElementsArr2)
              ]);
              startRotator();
              additionalSettings();
              creativeReady();
            },
            fail: function(e){
              R.fallback(e);
            }
          });

      } else if (width === 320 && height === 50)  {
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  ////   320x50
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        var megaBatch = R.create("batch")
          .require(requiredArr)
          .add(nDotsArr)
          .require(catImgsArr, 1)
          .add(allElementsArr2)
          .render({
            success: function(){
              hideFailed(R.filter.removeParallel(catImgsArr,R.filter.parallel(catImgsArr)));
              displayLoaded([
                R.filter.success(requiredArr),
                R.filter.success(nDotsArr),
                 R.filter.success(catImgsArr),
                R.filter.success(allElementsArr2)
              ]);
               startRotator();
              additionalSettings();
              creativeReady();
            },
            fail: function(e){
              R.fallback(e);
            }
          });

      } else if (width === 320 && height === 100)  {
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  ////  320x100
        // ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// /////////////  /////////////
      var megaBatch = R.create("batch")
          .require(requiredArr)
          .require(catImgsArr, 1)
          .add(nDotsArr)
          .add(group16Array)
          .add(allElementsArr2)
          .render({
            success: function(){
              hideFailed(R.filter.removeParallel(catImgsArr,R.filter.parallel(catImgsArr)));
              displayLoaded([
                R.filter.success(requiredArr),
                R.filter.success(catImgsArr),
                R.filter.success(nDotsArr),
                R.filter.success(group16Array),
                R.filter.success(allElementsArr2)
              ]);
              startRotator();
              additionalSettings();
              creativeReady();
            },
            fail: function(e){
              R.fallback(e);
            }
          });

      }

      function displayLoaded(loaded){
        for(var i = 0; i < loaded.length; i++){
          for(var j = 0;  j < loaded[i].length; j++){
            if(loaded[i][j] && loaded[i][j].element){
              loaded[i][j].visibility = "";
            }
          }
        }
      };

      function hideFailed(removed){
        for(var i = 0; i < removed.length; i++){
          if(removed[i] && removed[i].element){
            removed[i].display = "none";
            removed[i].parentNode = "";
          }
        }
      };

      var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:0, parentNode:stage});
      hit_area.on("click", adHit);

      //ADDING CTT JUNK VARS
      /* var hit_area = R.create("div").set({id:"ad_hit", width: width, height: height, pointerEvents: "auto", cursor: "pointer", zIndex:100, parentNode:stage});
      hit_area.on("click", adHit); */

      /* [END_CREATE_ELEMENTS] */
      //creativeReady()

      // All Animation goes here
      function animateElements() {



        var ease1 = "Power3.easeOut";
        var dur = .7;

        var all_frames = new TimelineMax()
        if(obj.style_img){all_frames.from(style_img.element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, 0)};
        if(obj.logo_img){all_frames.from(logo_img.element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, 0)};
        if(obj.preheader_text){all_frames.from(preheader_text.element, dur, {y: "+=10", autoAlpha: 0,  ease: ease1}, 0.1)};
        if(obj.headline_text){all_frames.from(headline_text.element, dur, {y: "+=10", autoAlpha: 0,  ease: ease1}, 0.2)};
        if(obj.subhead_text){all_frames.from(subhead_text.element, dur, {y: "+=10", autoAlpha: 0,  ease: ease1}, 0.3)};
        if(obj.rotatorFadeContainer){all_frames.from(rotatorFadeContainer.element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, 0.5)};
        if(obj.cat_text){all_frames.from(cat_textArr[0].element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, .6)};
        if(obj.price_text){all_frames.from(price_textArr[0].element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, .7)};
        if(obj.nDotsContainer){all_frames.from(nDotsContainer.element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, .8)};
        if(obj.cta_color){all_frames.from(cta_color.element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, 1)};
        if(obj.cta_text){all_frames.from(cta_text.element, dur, {y: "+=10", autoAlpha: 0, ease: ease1}, 1)};
        if(obj.details_text){all_frames.from(details_text.element, dur, {autoAlpha: 0, ease: ease1}, 1.2)};
        all_frames.add(TweenMax.delayedCall(.25, rotatorFade.startAutoPlay))

        var tl = new TimelineMax()
          .add(all_frames)

        var tlDuration = tl.duration();
        tl.duration(R.create("var").set({name:"duration", defaultValue:tlDuration, dataType: "Number", exposed:true}).render().value())
        /* [END_ANIMATE_ELEMENTS] */
      }
    }

    function adHit(e) {
      //console.log("adHit");
      try{
        // prevent event bubbling
        e.stopPropagation();
      } catch(err){}

      e = e || window.event;
      var instance = R.get(e.target);
      Analytics.fire({event: "click", instance: instance,  currentInstance:instance, details:""});
      var index = 0;
      if (instance && instance.data && instance.data.hitIndex) {
        index = instance.data.hitIndex;
      }
      dmo.handleCommand.call(dmo, "click", [index]);

    }

    function fallback(){

      R.create("ImageIE7").set({
        src: evergreenImg,
        subdirectory: "",
        directoryType: "evergreen",
        width: Platform.fetch().placementWidth,
        height: Platform.fetch().placementHeight,
        maxWidth: Platform.fetch().placementWidth,
        maxHeight: Platform.fetch().placementHeight,
        borderWidth:1,
        borderStyle:"solid",
        borderColor:"#CCCCCC",
        boxSizing:"border-box",
        position:"absolute",
        zIndex:500,
        display:"block"
      }).complete(function (inst) {
        if (stage) {
          // hide all elements that get created from here out
          Settings.overwrite({display: "none"});
          // hide all existing elements (ImageIE7 is not logged in SelectorEngine)
          var allElements = R.get("");
          var i = allElements.length;
          while (--i > -1) {
            if (allElements[i] !== stage && allElements[i].element) {
              allElements[i].display = "none";
            }
          }
          stage.appendChild(inst);
          stage.display = "block";
        } else {
          parentDiv.appendChild(inst.element);
        }
        inst.element.onclick = adHit;

        animate = null;

        creativeReady();
      }).render();
    }

    function assignSelector() {
      var defined = require.s.contexts[context].defined;
      var registry = require.s.contexts[context].registry;

      TweenMax = enableModule(defined,registry, "TweenMax");
      if(TweenMax){TweenMax.selector = R.selector}
      TweenLite = enableModule(defined,registry, "TweenLite");
      if (TweenLite){ Settings.overwrite({GSAPSelector: TweenLite.selector});TweenLite.selector = R.selector;}
      TimelineLite = enableModule(defined,registry, "TimelineLite");
      TimelineMax = enableModule(defined,registry, "TimelineMax");
      Hammer = enableModule(defined, registry, "Hammer");

      function enableModule(defined, registry, name){
        if (registry[name] && !defined[name]){
          registry[name].enable();
        }
        if (defined[name]) {
          return defined[name];
        }
      }
    }

    function log(msg) {
      if (window && window.console){
        var c = "Creative: ";
        try {
          if (window.console.debug && typeof msg === "object"){
            console.debug(msg);
          } else if (window.console.log){
            console.log(c + msg);
          }
        } catch(e){}
      }
    }

    function registerCallback(evt, callback, scope) {
      registeredCallbacks.push({evt:evt, callback:callback, scope:scope});
      return reveal;
    }

    function checkForCallback(evt, params) {
      if (!evt){return;}
      var arr = registeredCallbacks;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].evt === evt) {
          if (arr[i].callback) {
            try{
              arr[i].callback.call(arr[i].scope, params);
            } catch(e) { log("Callback failed"); }
          }
        }
      }
    }

    function isArray(val) {
      if (!Array.isArray) {
        Array.isArray = function (vArg) {
          return Object.prototype.toString.call(vArg) === "[object Array]";
        };
      }
      return Array.isArray(val);
    }

    function environReady(isReady) {
      if (isEnvironReady === false){
        isEnvironReady = isReady;
        if (isReady === true) {
          logEnvironStatus("parentEnvironment", isEnvironReady);
        }
      }
      return reveal;
    }

    function creativeReady() {
      if (isCreativeReady === false) {
        isCreativeReady = true;
        var xmlPush = require.s.contexts[context].defined['platform/advantage/XMLPush'];
        if (xmlPush) { xmlPush.init(); }
        checkForCallback("creative_ready");
        logEnvironStatus("creative", isCreativeReady);
      }
    }

    function logEnvironStatus(src, val) {
      environStatuses.push({src: src, val: val});
      if (environStatuses.length !== environTotals && !!checkEnvironStatus("parentEnvironment")){
        //Create Timer
        if (!timeoutTimer && startTimer){
          startTimer();
        }
      }
      if (environStatuses.length === environTotals) {
        showCreative();
      }
    }

    function checkEnvironStatus(src) {
      for (var i=0; i<environStatuses.length; i++){
        if (environStatuses[i].src === src) {
          return environStatuses[i].val;
        }
      }
      return false;
    }

    function showCreative() {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
      checkForCallback("creative_shown");
      if (Analytics){
        Analytics.fire({
          event: AnalyticsContent.CREATIVE_SHOWN,
          instance: reveal
        });
      }

      // animate the correct orientation
      if (animate) {
        animate();
      }
    }

    var reveal = {
      init: init,
      registerCallback:registerCallback,
      environmentReady:environReady,
      enviromentReady:environReady
    };
    return reveal;
  }
  creatives.push(Creative);
  return Creative;
}());