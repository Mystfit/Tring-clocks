TRINGJS.DataFormatter = function(data)
{
    this.data = data
}

TRINGJS.DataFormatter.READINGS = 'readings'
TRINGJS.DataFormatter.DAY_SUMMARIES = 'day_summaries'
TRINGJS.DataFormatter.MONTH_SUMMARIES = 'month_summaries'

TRINGJS.DataFormatter.prototype =  {
    constructor : TRINGJS.DataFormatter,

    get_merged : function()
    {
        var data = {}
        merge_types = this.detect_merge(this.data.meters[0])
        for (var i = merge_types.length - 1; i >= 0; i--) {
            var key = TRINGJS.DataFormatter[merge_types[i]]
            data[key] = JSON.parse(JSON.stringify(this.data.meters[0][key]))
            for (var j = this.data.meters.length - 1; j >= 1; j--) {
                data[key] = this.merge(data[key], this.data.meters[j][key], key)
            };
        };
        return data
    },

    get_hours : function()
    {
        var mergedData = this.get_merged();
        var dayData = [];
        var modulo = 2;
        var sum = 0;

        for(var day = 0; day < mergedData.readings.length; day++)
        {
            var hourData = [];

            for(var hour = 0; hour < mergedData.readings[day].data.length; hour++)
            {
                sum += mergedData.readings[day].data[hour].reading;
                if(hour % modulo == 0){
                    hourData.push({reading: sum, time: mergedData.readings[day].data[hour].time});
                    sum = 0;
                }
            }

            dayData.push({date:new Date(mergedData.readings[day].date), data:hourData});
        }       

        return dayData;
    },


    //Internal merge function
    //-----------------------
    merge : function(first, second, merge_type)
    {
        switch(merge_type)
        {
            case TRINGJS.DataFormatter.READINGS:
                return this.merge_readings(first, second)
            break;
            case TRINGJS.DataFormatter.DAY_SUMMARIES:
                return this.merge_summaries(first, second)
            break;
            case TRINGJS.DataFormatter.MONTH_SUMMARIES:
                return this.merge_summaries(first, second)
            break;
        }
    },

    merge_readings : function(first, second)
    {
        for (var i = first.length - 1; i >= 0; i--) {
            for (var j = first[i].data.length - 1; j >= 0; j--) {
                first[i].data[j].reading += second[i].data[j].reading
            };
        };
        return first
    },

    merge_summaries : function(first, second)
    {
        for (var i = first.length - 1; i >= 0; i--) {
            first[i].data.average += second[i].data.average
            first[i].data.total += second[i].data.total

            if(first[i].data.hasOwnProperty('day_summaries')) {
                first[i].data.day_summaries = this.merge_summaries(first[i].data.day_summaries, second[i].data.day_summaries)
            }
        };
        return first
    },

    detect_merge : function(obj)
    {
        var merge_types = []
        if(obj.hasOwnProperty('readings')) {
            merge_types.push('READINGS')
        }

        if (obj.hasOwnProperty('day_summaries')) {
            merge_types.push('DAY_SUMMARIES')
        }

        if (obj.hasOwnProperty('month_summaries')) {
            merge_types.push('MONTH_SUMMARIES')
        }

        return merge_types
    }
}