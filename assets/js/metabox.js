/**
 * ecmWP_Metabox
 *
 */

(function($) {
	$(document).ready(function() {

		// Default mode
		var mode = ecmWP_Metabox.mode;

		$("#_ecm_mode").val( mode );

		// Is ECM on?
		if ( $("input[name='_ecm_on']:checked").val() == "0" ) {
			$(".cmb-row").slice(1).hide();
		} else {
			// Hide GPX field in mode:marker
			$("#_ecm_gpx").closest(".cmb-row").hide();
            $("#_ecm_color").closest(".cmb-row").hide();
            $("#_ecm_symbol_select").closest(".cmb-row").show();
		}

		$("input[name='_ecm_on']").change(function() {
			if ( $("input[name='_ecm_on']:checked").val() == "0" ) {
				$(".cmb-row").slice(1).hide();
			} else {
				$(".cmb-row").slice(1).show();

                $("#_ecm_symbol_select").closest(".cmb-row").show();
				if ( $("#_ecm_mode").val() == "route" ) {
                    $("#_ecm_gpx").closest(".cmb-row").show();
                    $("#_ecm_color").closest(".cmb-row").show();
                } else {
                    $("#_ecm_gpx").closest(".cmb-row").hide();
                    $("#_ecm_color").closest(".cmb-row").hide();
                }
            }
	   });

		// Change mode
        $("#_ecm_mode").change(function() {

            mode = $(this).val();

            // Hide both controls
            $(".controls-marker").addClass("hidden");
            $(".controls-route").addClass("hidden");

            // Show the selected controls
            $(".controls-" + mode).removeClass("hidden");

            $("#_ecm_symbol_select").closest(".cmb-row").show();
            if ( mode == "route" ) {
            	$("#_ecm_gpx").closest(".cmb-row").show();
                $("#_ecm_color").closest(".cmb-row").show();
            } else {
            	$("#_ecm_gpx").closest(".cmb-row").hide();
                $("#_ecm_color").closest(".cmb-row").hide();
            }

            // Set ECMAdminMap mode
            ECMAdminMap.setMode(mode);

        });

        $("#getRouteBtn").click(function() {
            var waypoints = ECMAdminMap.getRouteWaypoints();
            if (waypoints) {
                $("#waypoints").html(JSON.stringify(waypoints,null, 2));
                $("#_ecm_coordinates").val(JSON.stringify(waypoints,null, 0));
            }
            else
            {
                alert('Draw a route on the map first');
            }
        });

        $( document.getElementById("_ecm_symbol_select") ).ddslick({
		    data: ecmWP_Metabox.symbols,
		    width: 350,
		    imagePosition: "left",
		    onSelected: function ( data ) {
		        $( document.getElementById("_ecm_symbol") ).val( data.selectedData.value );
		    }
		});

	});
})(jQuery);
