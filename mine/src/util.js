const Util = {
    distanceFormula: function(x1, y1, x2, y2) {
        var withinRoot = Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
        return Math.pow(withinRoot, 0.5);
    },
    angleBetweenPoints: function(x1, x2, y1, y2) {
        var angleRadians = Math.atan2(x1-x2, y1-y2);
        var angleDeg = angleRadians * 180 / Math.PI;
        return angleDeg
    }
};