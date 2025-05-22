package vn.vnpt_tech.airquality.air_quality_monitoring.helper;

public class AqiCalculator {

    public static int calculateAQI(double concentration, double[] cBreakpoints, int[] iBreakpoints) {
        for (int i = 0; i < cBreakpoints.length - 1; i++) {
            if (concentration >= cBreakpoints[i] && concentration <= cBreakpoints[i + 1]) {
                double C_low = cBreakpoints[i];
                double C_high = cBreakpoints[i + 1];
                int I_low = iBreakpoints[i];
                int I_high = iBreakpoints[i + 1];

                return (int) Math.round(((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low);
            }
        }
        return -1; // Out of range or invalid
    }

    public static int aqiPm25(double value) {
        double[] c = {0.0, 12.0, 35.4, 55.4, 150.4, 250.4, 500.0};
        int[] i =    {0,   50,   100,  150,  200,   300,   500};
        return calculateAQI(value, c, i);
    }

    public static int aqiPm10(double value) {
        double[] c = {0, 54, 154, 254, 354, 424, 604};
        int[] i =    {0, 50, 100, 150, 200, 300, 500};
        return calculateAQI(value, c, i);
    }

    public static int aqiCo(double value) {
        double[] c = {0.0, 4.4, 9.4, 12.4, 15.4, 30.4, 50.4};
        int[] i =    {0,   50,  100, 150,  200,  300, 500};
        return calculateAQI(value, c, i);
    }

    public static int aqiSo2(double value) {
        double[] c = {0.0, 35, 75, 185, 304, 604, 1004}; // ppb
        int[] i =    {0,   50, 100, 150, 200, 300, 500};
        return calculateAQI(value, c, i);
    }

    public static int aqiNo2(double value) {
        double[] c = {0.0, 53, 100, 360, 649, 1249, 2049}; // ppb
        int[] i =    {0,   50, 100, 150, 200, 300, 500};
        return calculateAQI(value, c, i);
    }

    public static int aqiO3(double value) {
        double[] c = {0.0, 0.054, 0.070, 0.085, 0.105, 0.200}; // ppm (8-hour avg)
        int[] i =    {0,     50,     100,   150,   200,   300}; // simplified for 8h
        return calculateAQI(value, c, i);
    }
}
