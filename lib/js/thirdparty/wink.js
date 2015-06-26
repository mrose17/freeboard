// jshint asi: true

var wink = { indicator: {} }

// data, e.g., datasources["WinKData"]["light_bulb"]["Kitchen"]

wink.indicator.value = function(data, property) {
    var value

    if (!data) return false
    if ((typeof data.connection !== 'undefined') && (!data.connection)) return false
    if ({ cameras: true, remotes: true, sprinklers: true }[data.object_type]) return false
    if (typeof property !== 'undefined') {
        if ((typeof data[property] === 'undefined') || (data[property] === null )) return true
        return { sensor_pods     : true
               , smoke_detectors : true
               , thermostats     : (property === 'temperature') || (property === 'humidity')
               }[data.object_type] || (property === 'battery')
    }

    value = { buttons         : true
            , gangs           : true
            , garage_doors    : data.position > 0
            , hubs            : true
            , linked_services : true
            , light_bulbs     : data.powered
            , locks           : data.locked
            , sensor_pods     : true
            , shades          : data.position > 0
            , smoke_detectors : true
            , thermostats     : data.mode !== 'off'
            , unknown_devices : true
            }[data.object_type]
    return (typeof value !== 'undefined' ? value : data.powered)
}


wink.indicator.on_text = function(data, property) {
    return on_text(data, property)
}

var on_text = function(data, property) {
    var text, value

    if (!data) return ''
    text =  { buttons         : ''
            , garage_doors    : 'OPEN'
            , hubs            : 'OK'
            , linked_services : 'OK'
            , light_bulbs     : (data.brightness == 1.0  ? 'ON'   : (data.brightness * 100) + '%')
            , locks           : 'LOCKED'
            , sensor_pods     : 'PROPERTY?'
            , shades          : (data.position == 1.0    ? 'OPEN' : (data.position * 100) + '%')
            , smoke_detectors : 'OK'
            , thermostats     : (data.cool_active        ? 'COOL' : data.heat_active ? 'HEAT' : data.aux_active ? 'AUX' : data.fan_active? 'FAN' : 'IDLE')
            }[data.object_type] || 'ON'
    if (typeof property === 'undefined') return (typeof text !== 'undefined' ? text : 'ON4')
    if ((typeof data[property] === 'undefined') || (data[property] === null )) return ''

    value = data[property]
    text =  { co_detected     : (value ? 'CO DETECTED'     : '')
            , fault           : (value ? 'FAULT DETECTED'  : '')
            , liquid_detected : (value ? 'LEAK DETECTED'   : '')
            , locked          : (value ? 'LOCKED'          : 'UNLOCKED')
            , loudness        : (value ? 'LOUD'            : '')
            , noise           : (value ? 'NOISY'           : '')
            , motion          : (value ? 'MOTION'          : '')
            , opened          : (value ? 'OPEN'            : 'CLOSED')
            , presence        : (value ? 'PRESENCE'        : '')
            , smoke_detected  : (value ? 'SMOKE DETECTED'  : '')
            , tamper_detected : (value ? 'TAMPER DETECTED' : '')
            , vibration       : (value ? 'VIBRATION'       : '')

            , battery         : ((value * 100) + '%')
            , brightness      : ((value * 100) + '%')
            , co_severity     : ((value * 100) + '%')
            , humidity        : ((value > 1.0 ? value.toFixed(0) : value * 100) + '%')
            , smoke_severity  : ((value * 100) + '%')

            , temperature     : (typeof value === 'number' ? (value.toFixed(1) + '&deg;C' + ' / ' + ((value * 1.8) + 32).toFixed(1) + '&deg;F') : '')
            }[property]
    if (text === '') text = 'OK'

    return text
}


wink.indicator.off_text = function(data, property) {
    return off_text(data, property)
}

var off_text = function(data, property) {
    if (!data) return ''
    if ((typeof data.connection !== 'undefined') && (!data.connection)) return 'ERR'
    if (typeof property !== 'undefined') return ''

    return { buttons          : 'IDLE'
           , garage_doors     : (data.position !== null ? 'CLOSED' : 'UNKNOWN' )
           , locks            : 'UNLOCKED'
           , shades           : (data.position !== null ? 'CLOSED' : 'UNKNOWN' )
           }[data.object_type] || 'OFF'
}


freeboard.addStyle('.wink-indicator-circle', "border-radius:50%;width:22px;height:22px;border:2px solid #3d3d3d;margin-top:5px;float:left;margin-right:10px;");
freeboard.addStyle('.wink-indicator-triangle', "border-radius:50%;width:0;height:0;border-left:15px solid transparent;border-right:15px solid transparent;margin-top:5px;float:left;margin-right:10px;");

wink.indicator.style_element = function(data, property) {
    var params = style_element(data, property)

    if (params === '') return params

    if (params.shape == 'triangle') {
        return ('<div class="wink-indicator-' + params.shape + '" style="border-top: 20px solid ' + params.color + ';"></div>')
    }
    return ('<div class="wink-indicator-'     + params.shape + '" style="background-color:'  + params.color + ';"></div>')
}

var style_element = function(data, property) {
    var color, value
      , black  = '#000000'
      , blue   = '#00b8f1'
      , green  = '#00ff00'
      , red    = '#ff0000'
      , shape  = 'circle'
      , white  = '#ffffff'
      , yellow = '#eed202'

    if (!data) return ''
    if ((typeof data.connection !== 'undefined') && (!data.connection)) return { color: red, shape: 'triangle' }

    color = { binary_switches : (data.powered          ? blue  : black)
            , buttons         : (!data.pressed         ? blue  : green)
            , garage_doors    : (data.position === 0.0 ? blue  : yellow)
            , hubs            : (!data.update_needed   ? blue  : yellow)
            , light_bulbs     : (data.powered          ? white : black)
            , shades          : (data.position === 0.0 ? blue  : data.position === null ? yellow : green)
            , thermostats     : ({ cool_only : blue, heat_only : red }[data.mode] || green)
            }[data.object_type] || blue

    if (typeof property === 'undefined') return { color: color, shape: shape }
    if ((typeof data[property] === 'undefined') || (data[property] === null )) return ''

    value = data[property]    
    color = { co_detected     : value && red
            , fault           : value && red
            , liquid_detected : value && red
            , locked          : (!value) && red
            , loudness        : value && yellow
            , noise           : value && yellow
            , motion          : value && yellow
            , opened          : value && yellow
            , presence        : value && yellow
            , smoke_detected  : value && red
            , tamper_detected : value && red
            , vibration       : value && yellow

            , battery         : (value ==  1.0 ? blue : value > 0.66 ? green : value > 0.33 ? yellow : red)
            , brightness      : false
            , co_severity     : (value > 0) && red
            , humidity        : false
            , smoke_severity  : (value > 0) && red

            , temperature     : false
            }[property] || blue

    if ((color != blue) && (color != green)) shape = 'triangle'

    return { color: color, shape: shape }
}
