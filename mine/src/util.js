const Util = {
    distanceFormula: function(x1, y1, x2, y2) {
        var withinRoot = Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
        return Math.pow(withinRoot, 0.5);
    }
};