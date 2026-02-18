class HealthRiskScoringService {
  constructor() {
    this.riskFactors = {
      age: {
        under5: 15,
        over65: 20,
        over50: 10,
        normal: 0,
      },
      chronicConditions: {
        diabetes: 15,
        hypertension: 10,
        heartDisease: 20,
        copd: 15,
        asthma: 10,
        cancer: 25,
        kidneyDisease: 20,
        liverDisease: 15,
        autoimmune: 15,
        obesity: 10,
      },
      symptoms: {
        high: 25,
        medium: 15,
        low: 5,
      },
      vitals: {
        highFever: 15,
        lowOxygen: 25,
        highHeartRate: 10,
        lowHeartRate: 10,
        highBP: 15,
        lowBP: 10,
      },
      lifestyle: {
        smoker: 15,
        alcoholExcess: 10,
        sedentary: 5,
        poorDiet: 5,
      },
      recentEvents: {
        surgery: 10,
        hospitalization: 15,
        infection: 10,
      },
    };
  }

  calculateRiskScore(patientData, symptoms, vitals = {}, lifestyle = {}) {
    let score = 0;
    const factors = [];
    const warnings = [];

    // Age factor
    if (patientData.age < 5) {
      score += this.riskFactors.age.under5;
      factors.push({
        factor: "age",
        contribution: this.riskFactors.age.under5,
        reason: "Age under 5 years",
      });
    } else if (patientData.age > 65) {
      score += this.riskFactors.age.over65;
      factors.push({
        factor: "age",
        contribution: this.riskFactors.age.over65,
        reason: "Age over 65 years",
      });
    } else if (patientData.age > 50) {
      score += this.riskFactors.age.over50;
      factors.push({
        factor: "age",
        contribution: this.riskFactors.age.over50,
        reason: "Age over 50 years",
      });
    }

    // Chronic conditions
    if (
      patientData.chronicConditions &&
      patientData.chronicConditions.length > 0
    ) {
      patientData.chronicConditions.forEach((condition) => {
        const conditionLower = condition.toLowerCase();
        let found = false;

        for (const [key, value] of Object.entries(
          this.riskFactors.chronicConditions,
        )) {
          if (conditionLower.includes(key)) {
            score += value;
            factors.push({
              factor: "chronic_condition",
              contribution: value,
              reason: condition,
            });
            found = true;
            break;
          }
        }

        if (!found) {
          score += 5; // Default for other conditions
          factors.push({
            factor: "chronic_condition",
            contribution: 5,
            reason: condition,
          });
        }
      });
    }

    // Symptom severity
    symptoms.forEach((symptom) => {
      if (symptom.severity === "high") {
        score += this.riskFactors.symptoms.high;
        factors.push({
          factor: "symptom_severity",
          contribution: this.riskFactors.symptoms.high,
          reason: `${symptom.name} - high severity`,
        });
      } else if (symptom.severity === "medium") {
        score += this.riskFactors.symptoms.medium;
        factors.push({
          factor: "symptom_severity",
          contribution: this.riskFactors.symptoms.medium,
          reason: `${symptom.name} - medium severity`,
        });
      }

      // Check for red flag symptoms
      if (this.isRedFlagSymptom(symptom)) {
        warnings.push(
          `⚠️ Red flag: ${symptom.name} requires immediate attention`,
        );
      }
    });

    // Vitals
    if (vitals.temperature && vitals.temperature > 102) {
      score += this.riskFactors.vitals.highFever;
      factors.push({
        factor: "vitals",
        contribution: this.riskFactors.vitals.highFever,
        reason: "High fever (>102°F)",
      });
      warnings.push("⚠️ High fever indicates possible serious infection");
    }

    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
      const points = vitals.oxygenSaturation < 90 ? 25 : 15;
      score += points;
      factors.push({
        factor: "vitals",
        contribution: points,
        reason: `Low oxygen saturation (${vitals.oxygenSaturation}%)`,
      });
      warnings.push(
        "⚠️ Low oxygen saturation requires immediate medical attention",
      );
    }

    if (vitals.heartRate) {
      if (vitals.heartRate > 100) {
        score += this.riskFactors.vitals.highHeartRate;
        factors.push({
          factor: "vitals",
          contribution: this.riskFactors.vitals.highHeartRate,
          reason: `High heart rate (${vitals.heartRate} bpm)`,
        });
      } else if (vitals.heartRate < 60) {
        score += this.riskFactors.vitals.lowHeartRate;
        factors.push({
          factor: "vitals",
          contribution: this.riskFactors.vitals.lowHeartRate,
          reason: `Low heart rate (${vitals.heartRate} bpm)`,
        });
      }
    }

    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split("/").map(Number);
      if (systolic > 140 || diastolic > 90) {
        score += this.riskFactors.vitals.highBP;
        factors.push({
          factor: "vitals",
          contribution: this.riskFactors.vitals.highBP,
          reason: `High blood pressure (${vitals.bloodPressure})`,
        });
      } else if (systolic < 90 || diastolic < 60) {
        score += this.riskFactors.vitals.lowBP;
        factors.push({
          factor: "vitals",
          contribution: this.riskFactors.vitals.lowBP,
          reason: `Low blood pressure (${vitals.bloodPressure})`,
        });
      }
    }

    // Lifestyle factors
    if (lifestyle.smoker) {
      score += this.riskFactors.lifestyle.smoker;
      factors.push({
        factor: "lifestyle",
        contribution: this.riskFactors.lifestyle.smoker,
        reason: "Smoking",
      });
    }

    if (lifestyle.alcoholExcess) {
      score += this.riskFactors.lifestyle.alcoholExcess;
      factors.push({
        factor: "lifestyle",
        contribution: this.riskFactors.lifestyle.alcoholExcess,
        reason: "Excessive alcohol consumption",
      });
    }

    // Recent medical events
    if (patientData.recentSurgery) {
      score += this.riskFactors.recentEvents.surgery;
      factors.push({
        factor: "recent_event",
        contribution: this.riskFactors.recentEvents.surgery,
        reason: "Recent surgery",
      });
    }

    if (patientData.recentHospitalization) {
      score += this.riskFactors.recentEvents.hospitalization;
      factors.push({
        factor: "recent_event",
        contribution: this.riskFactors.recentEvents.hospitalization,
        reason: "Recent hospitalization",
      });
    }

    // Determine risk level
    let riskLevel = "low";
    let urgency = "routine";
    let color = "green";

    if (score >= 70) {
      riskLevel = "critical";
      urgency = "immediate";
      color = "red";
    } else if (score >= 50) {
      riskLevel = "high";
      urgency = "immediate";
      color = "red";
    } else if (score >= 30) {
      riskLevel = "medium";
      urgency = "soon";
      color = "yellow";
    } else if (score >= 15) {
      riskLevel = "low";
      urgency = "routine";
      color = "green";
    } else {
      riskLevel = "minimal";
      urgency = "routine";
      color = "blue";
    }

    return {
      score: Math.min(score, 100),
      riskLevel,
      urgency,
      color,
      factors: factors.slice(0, 5), // Top 5 factors
      warnings,
      recommendations: this.getRecommendations(
        riskLevel,
        patientData,
        symptoms,
        warnings,
      ),
      requiresEmergency: score >= 70 || this.hasEmergencySymptoms(symptoms),
    };
  }

  isRedFlagSymptom(symptom) {
    const redFlags = [
      "chest pain",
      "shortness of breath",
      "severe headache",
      "confusion",
      "slurred speech",
      "facial drooping",
      "seizure",
      "unconsciousness",
      "severe bleeding",
      "vomiting blood",
      "blood in stool",
      "suicidal thoughts",
    ];

    return redFlags.some((flag) => symptom.name.toLowerCase().includes(flag));
  }

  hasEmergencySymptoms(symptoms) {
    const emergencySymptoms = [
      "chest pain",
      "shortness of breath",
      "severe headache",
      "unconsciousness",
      "seizure",
    ];

    return symptoms.some((symptom) =>
      emergencySymptoms.some((emergency) =>
        symptom.name.toLowerCase().includes(emergency),
      ),
    );
  }

  getRecommendations(riskLevel, patientData, symptoms, warnings) {
    const recommendations = [];

    if (riskLevel === "critical" || riskLevel === "high") {
      recommendations.push("🚨 IMMEDIATE EMERGENCY CARE REQUIRED");
      recommendations.push("Call emergency services (911/112) immediately");
      recommendations.push("Do NOT wait for appointment - go to nearest ER");
      recommendations.push("If alone, call for help immediately");
    } else if (riskLevel === "medium") {
      recommendations.push("Schedule doctor appointment within 24 hours");
      recommendations.push("Monitor symptoms closely - keep a log");
      recommendations.push("Rest and avoid strenuous activities");
      recommendations.push("Stay hydrated and eat light, nutritious food");
      recommendations.push("Have someone check on you regularly");
    } else if (riskLevel === "low") {
      recommendations.push("Monitor symptoms at home");
      recommendations.push(
        "Consult doctor if symptoms worsen or persist > 3 days",
      );
      recommendations.push(
        "Maintain healthy lifestyle: rest, hydration, proper nutrition",
      );
      recommendations.push("Consider teleconsultation for convenience");
    } else {
      recommendations.push("No immediate concerns detected");
      recommendations.push("Continue healthy habits");
      recommendations.push("Schedule routine check-up if due");
    }

    // Specific recommendations based on symptoms
    symptoms.forEach((symptom) => {
      if (symptom.name === "fever") {
        recommendations.push("Monitor temperature every 4 hours");
        recommendations.push(
          "Use paracetamol if temperature > 100°F (follow dosage instructions)",
        );
        recommendations.push("Use cold compresses for comfort");
      } else if (symptom.name === "cough") {
        recommendations.push("Use honey and warm fluids for relief");
        recommendations.push("Avoid cold foods and drinks");
        recommendations.push("Consider using a humidifier");
      } else if (symptom.name === "headache") {
        recommendations.push("Rest in dark, quiet room");
        recommendations.push(
          "Stay hydrated - dehydration often causes headaches",
        );
        recommendations.push("Avoid screen time");
      } else if (symptom.name === "nausea") {
        recommendations.push("Eat small, bland meals");
        recommendations.push("Avoid spicy, fatty foods");
        recommendations.push("Sip clear fluids slowly");
      }
    });

    // Add warnings as recommendations
    warnings.forEach((warning) => {
      recommendations.push(warning);
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  getRiskColor(score) {
    if (score >= 70) return "#dc2626"; // red-600
    if (score >= 50) return "#ef4444"; // red-500
    if (score >= 30) return "#f59e0b"; // amber-500
    if (score >= 15) return "#10b981"; // emerald-500
    return "#3b82f6"; // blue-500
  }

  getRiskDescription(riskLevel) {
    const descriptions = {
      critical:
        "Critical risk - Life-threatening condition requiring immediate emergency care",
      high: "High risk - Serious condition requiring urgent medical attention",
      medium: "Moderate risk - Should see doctor within 24 hours",
      low: "Low risk - Monitor at home, consult if worsens",
      minimal: "Minimal risk - No immediate concerns",
    };
    return descriptions[riskLevel] || descriptions.minimal;
  }
}

export default new HealthRiskScoringService();
