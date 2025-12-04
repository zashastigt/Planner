const cache = {}
export default (option, dayjsClass, dayjsFactory) => {
    dayjsClass.prototype.time = function(date){
        let time = this
        
        if(date === 0) {
            if(cache[time.unix()]?.[date]) return cache[time.unix()][date]
            
            time = time.set("hour", 0)
                .set("minute", 0)
                .set("second", 0)
            cache[time.unix()] = {}
            cache[time.unix()][date] = time
        }
        else if(date) {
            if(cache[time.unix()]?.[date.unix()]) cache[time.unix()][date.unix()]

            time = time.set("hour", date.hour())
                .set("minute", date.minute())
                .set("second", date.second())
            cache[time.unix()] = {}
            cache[time.unix()][date.unix()] = time
        }
        else {
            if(cache[time.unix()]?.time) return cache[time.unix()].time

            time = time.set("year", 0)
                .set("month", 0)
                .set("date", 0)
            cache[time.unix()] = {}
            cache[time.unix()].time = time
        }
        
        return time
    }
}