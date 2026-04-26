document.addEventListener('DOMContentLoaded', () => {

    // === Mobile Menu (for calculator page) ===
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            const isOpen = mobileNav.classList.contains('active');
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        });

        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });
    }

    // === Core Inputs ===
    const iWeight = document.getElementById('peptideWeight');
    const iWater = document.getElementById('waterVolume');
    const iTarget = document.getElementById('targetDose');

    // === Blend Elements ===
    const blendToggle = document.getElementById('blendToggle');
    const blendConfig = document.getElementById('blendConfig');
    const blendResults = document.getElementById('blendResults');
    const peptideList = document.getElementById('peptideList');
    const addPeptideBtn = document.getElementById('addPeptideBtn');

    // === Syringe Elements ===
    const syringeOptions = document.getElementById('syringeOptions');
    const syringeInfo = document.getElementById('syringeInfo');
    const ticksLabel = document.getElementById('ticksLabel');

    // === Duration Elements ===
    const durationToggle = document.getElementById('durationToggle');
    const durationConfig = document.getElementById('durationConfig');
    const durationSlider = document.getElementById('durationSlider');
    const durationResultsPanel = document.getElementById('durationResults');

    // New Duration Input Fields
    const durationDaysInput = document.getElementById('durationDaysInput');
    const durationDoseInput = document.getElementById('durationDoseInput');
    const durationDosesPerDay = document.getElementById('durationDosesPerDay');

    // Duration output elements
    const resTotalDoses = document.getElementById('resTotalDoses');
    const resDoseFrequency = document.getElementById('resDoseFrequency');
    const resDurationTarget = document.getElementById('resDurationTarget');
    const resRequiredDose = document.getElementById('resRequiredDose');
    const resDurationNote = document.getElementById('resDurationNote');
    const durationProgressFill = document.getElementById('durationProgressFill');
    const durationEndLabel = document.getElementById('durationEndLabel');

    // === Outputs ===
    const rVolume = document.getElementById('resVolume');
    const rTicks = document.getElementById('resTicks');
    const rConc = document.getElementById('resConc');
    const syringeLiquid = document.getElementById('syringeLiquid');

    // === State ===
    let peptideCounter = 0;
    let syringeSize = 1; // mL (1, 0.5, or 0.3)
    let lastEditedDurationField = 'dose'; // Which field was last edited by user

    // Color palette for peptide entries
    const peptideColors = [
        { bg: 'rgba(0, 210, 255, 0.06)', border: 'rgba(0, 210, 255, 0.25)', text: '#00d2ff' },
        { bg: 'rgba(138, 91, 255, 0.06)', border: 'rgba(138, 91, 255, 0.25)', text: '#8A5BFF' },
        { bg: 'rgba(0, 255, 136, 0.06)', border: 'rgba(0, 255, 136, 0.25)', text: '#00ff88' },
        { bg: 'rgba(255, 159, 67, 0.06)', border: 'rgba(255, 159, 67, 0.25)', text: '#ff9f43' },
        { bg: 'rgba(255, 71, 87, 0.06)', border: 'rgba(255, 71, 87, 0.25)', text: '#ff4757' },
        { bg: 'rgba(255, 234, 0, 0.06)', border: 'rgba(255, 234, 0, 0.25)', text: '#ffea00' },
        { bg: 'rgba(46, 213, 115, 0.06)', border: 'rgba(46, 213, 115, 0.25)', text: '#2ed573' },
        { bg: 'rgba(116, 185, 255, 0.06)', border: 'rgba(116, 185, 255, 0.25)', text: '#74b9ff' },
    ];

    // === Syringe Size Selector ===
    syringeOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.syringe-btn');
        if (!btn) return;

        syringeOptions.querySelectorAll('.syringe-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syringeSize = parseFloat(btn.dataset.size);
        calculate();
    });

    // === Blend Toggle ===
    blendToggle.addEventListener('change', () => {
        const isBlend = blendToggle.checked;
        blendConfig.classList.toggle('active', isBlend);

        if (isBlend && peptideList.children.length === 0) {
            addPeptideRow('', '5');
            addPeptideRow('', '5');
        }

        if (isBlend) syncTotalWeight();
        calculate();
    });

    // === Add Peptide Button ===
    addPeptideBtn.addEventListener('click', () => {
        addPeptideRow('', '');
    });

    // === Duration Toggle ===
    durationToggle.addEventListener('change', () => {
        const isActive = durationToggle.checked;
        durationConfig.classList.toggle('active', isActive);
        durationResultsPanel.classList.toggle('active', isActive);
        if (isActive) {
            // Sync dose input with main target dose
            durationDoseInput.value = iTarget.value;
            calculateDuration();
        }
    });

    // === Duration Input Fields ===
    // When user changes Days input
    if (durationDaysInput) {
        durationDaysInput.addEventListener('input', () => {
            lastEditedDurationField = 'days';
            // Sync slider
            durationSlider.value = durationDaysInput.value;
            calculateDuration();
        });
    }

    // When user changes Dose Per Admin
    if (durationDoseInput) {
        durationDoseInput.addEventListener('input', () => {
            lastEditedDurationField = 'dose';
            // Also update the main target dose field to keep them in sync
            iTarget.value = durationDoseInput.value;
            calculate();
        });
    }

    // When user changes Doses Per Day
    if (durationDosesPerDay) {
        durationDosesPerDay.addEventListener('input', () => {
            lastEditedDurationField = 'dosesPerDay';
            calculateDuration();
        });
    }

    // === Duration Slider ===
    if (durationSlider) {
        durationSlider.addEventListener('input', () => {
            lastEditedDurationField = 'days';
            if (durationDaysInput) {
                durationDaysInput.value = durationSlider.value;
            }
            calculateDuration();
        });
    }

    // === Add a Peptide Row ===
    function addPeptideRow(name = '', weight = '') {
        peptideCounter++;
        const index = peptideCounter;
        const colorIdx = (peptideList.children.length) % peptideColors.length;
        const color = peptideColors[colorIdx];

        const row = document.createElement('div');
        row.className = 'blend-row';
        row.dataset.index = index;
        row.style.setProperty('--row-accent', color.text);

        row.innerHTML = `
            <div class="blend-color-dot" style="background: ${color.text};"></div>
            <div class="blend-name-group">
                <input type="text" class="blend-name-input" placeholder="Peptide name" value="${name}" data-index="${index}">
            </div>
            <div class="blend-weight-group">
                <div class="input-with-unit">
                    <input type="number" class="blend-weight-input" value="${weight}" min="0.1" step="0.1" placeholder="mg" data-index="${index}">
                    <span class="unit">mg</span>
                </div>
            </div>
            <button class="remove-peptide-btn" data-index="${index}" title="Remove peptide">
                <i class="fas fa-times"></i>
            </button>
        `;

        peptideList.appendChild(row);

        // Attach listeners
        const weightInput = row.querySelector('.blend-weight-input');
        const nameInput = row.querySelector('.blend-name-input');
        const removeBtn = row.querySelector('.remove-peptide-btn');

        weightInput.addEventListener('input', () => {
            syncTotalWeight();
            calculate();
        });

        nameInput.addEventListener('input', () => {
            calculate();
        });

        removeBtn.addEventListener('click', () => {
            row.classList.add('removing');
            setTimeout(() => {
                row.remove();
                recolorRows();
                syncTotalWeight();
                calculate();
            }, 250);
        });

        syncTotalWeight();
        calculate();
    }

    // === Re-assign Colors After Removal ===
    function recolorRows() {
        const rows = peptideList.querySelectorAll('.blend-row');
        rows.forEach((row, i) => {
            const color = peptideColors[i % peptideColors.length];
            row.style.setProperty('--row-accent', color.text);
            row.querySelector('.blend-color-dot').style.background = color.text;
        });
    }

    // === Sync Total Weight from Blend Rows ===
    function syncTotalWeight() {
        const weightInputs = peptideList.querySelectorAll('.blend-weight-input');
        let total = 0;
        weightInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        iWeight.value = total > 0 ? total.toFixed(1) : '';
    }

    // === Get Syringe Info ===
    function getSyringeUnits() {
        const totalUnits = Math.round(syringeSize * 100);
        return totalUnits;
    }

    function getSyringeLabel() {
        if (syringeSize === 0.3) return 'U-30 (0.3mL)';
        if (syringeSize === 0.5) return 'U-50 (0.5mL)';
        return 'U-100 (1mL)';
    }

    // === Main Calculation ===
    function calculate() {
        const weightMg = parseFloat(iWeight.value) || 0;
        const waterMl = parseFloat(iWater.value) || 0;
        const targetMcg = parseFloat(iTarget.value) || 0;

        if (weightMg <= 0 || waterMl <= 0 || targetMcg <= 0) {
            rVolume.textContent = '0.00';
            rTicks.textContent = '0';
            rConc.textContent = '0.0';
            syringeLiquid.style.width = '0%';
            clearBlendResults();
            clearDurationResults();
            return;
        }

        // Concentration: mg per mL
        const concMgPerMl = weightMg / waterMl;

        // Target dose in mg
        const targetMg = targetMcg / 1000;

        // Volume to draw
        const volumeMl = targetMg / concMgPerMl;

        // Syringe ticks
        const unitsPerMl = 100;
        const ticks = volumeMl * unitsPerMl;

        // Update UI
        rVolume.textContent = volumeMl.toFixed(2);
        rTicks.textContent = Math.round(ticks);
        rConc.textContent = concMgPerMl.toFixed(1);

        // Syringe label
        syringeInfo.textContent = getSyringeLabel();
        ticksLabel.textContent = `Units on a ${syringeSize}mL syringe`;

        // Syringe graphic fill
        let fillPercent = Math.min((volumeMl / syringeSize) * 100, 100);
        syringeLiquid.style.width = `${fillPercent}%`;

        // Warning if volume exceeds syringe
        const syringeBody = document.querySelector('.syringe-body');
        if (volumeMl > syringeSize) {
            syringeBody.classList.add('overflow');
        } else {
            syringeBody.classList.remove('overflow');
        }

        // Blend results
        if (blendToggle.checked) {
            updateBlendResults(targetMcg, weightMg);
        } else {
            clearBlendResults();
        }

        // Duration results
        if (durationToggle.checked) {
            // Sync dose input if the main target dose was changed directly
            if (durationDoseInput && document.activeElement !== durationDoseInput) {
                durationDoseInput.value = Math.round(targetMcg);
            }
            calculateDuration();
        } else {
            clearDurationResults();
        }
    }

    // === Duration Calculation (bidirectional) ===
    function calculateDuration() {
        const weightMg = parseFloat(iWeight.value) || 0;
        if (weightMg <= 0) {
            clearDurationResults();
            return;
        }

        const weightMcg = weightMg * 1000;
        let days = parseFloat(durationDaysInput?.value) || 30;
        let dosePerAdmin = parseFloat(durationDoseInput?.value) || 500;
        let dosesPerDay = parseFloat(durationDosesPerDay?.value) || 1;

        // Bi-directional calculation based on which field was last edited
        // Total consumption per day = dosePerAdmin * dosesPerDay
        // Total vial mcg = weightMcg
        // days = weightMcg / (dosePerAdmin * dosesPerDay)
        // dosePerAdmin = weightMcg / (days * dosesPerDay)
        // dosesPerDay = weightMcg / (days * dosePerAdmin)

        switch (lastEditedDurationField) {
            case 'days':
                // User changed days → recalculate dose per admin
                if (days > 0 && dosesPerDay > 0) {
                    dosePerAdmin = weightMcg / (days * dosesPerDay);
                    if (durationDoseInput) durationDoseInput.value = Math.round(dosePerAdmin);
                    // Also update main target dose
                    iTarget.value = Math.round(dosePerAdmin);
                    // Recalc reconstitution without retriggering duration
                    recalcReconstitution();
                }
                break;
            case 'dose':
                // User changed dose → recalculate days
                if (dosePerAdmin > 0 && dosesPerDay > 0) {
                    days = weightMcg / (dosePerAdmin * dosesPerDay);
                    if (durationDaysInput) durationDaysInput.value = Math.round(days);
                    if (durationSlider) durationSlider.value = Math.min(365, Math.max(1, Math.round(days)));
                }
                break;
            case 'dosesPerDay':
                // User changed doses per day → recalculate days
                if (dosePerAdmin > 0 && dosesPerDay > 0) {
                    days = weightMcg / (dosePerAdmin * dosesPerDay);
                    if (durationDaysInput) durationDaysInput.value = Math.round(days);
                    if (durationSlider) durationSlider.value = Math.min(365, Math.max(1, Math.round(days)));
                }
                break;
        }

        // Ensure values are sensible
        days = Math.max(0.1, days);
        dosePerAdmin = Math.max(0.1, dosePerAdmin);
        dosesPerDay = Math.max(0.1, dosesPerDay);

        // Calculate display values
        const totalDailyMcg = dosePerAdmin * dosesPerDay;
        const totalDoses = weightMcg / dosePerAdmin;
        const doseFrequency = days / totalDoses; // days between doses

        // Format duration label
        const daysRounded = Math.round(days);
        const unitLabel = daysRounded === 1 ? '1 day' : `${daysRounded} days`;

        // Update outputs
        if (resTotalDoses) {
            resTotalDoses.textContent = totalDoses < 1 ? totalDoses.toFixed(1) : Math.floor(totalDoses);
        }

        // Dose frequency
        if (resDoseFrequency) {
            if (dosesPerDay >= 1 && dosesPerDay <= 1.05) {
                resDoseFrequency.textContent = '1';
                resDoseFrequency.nextElementSibling && (resDoseFrequency.closest('.result-value').querySelector('.unit-sm') || {}).textContent;
            } else {
                resDoseFrequency.textContent = dosesPerDay.toFixed(1);
            }
        }

        if (resDurationTarget) resDurationTarget.textContent = unitLabel;
        if (resRequiredDose) resRequiredDose.textContent = Math.round(dosePerAdmin);

        // Build the note text
        if (resDurationNote) {
            const roundedDose = Math.round(dosePerAdmin);
            const roundedDosesPerDay = Math.round(dosesPerDay);

            if (roundedDosesPerDay === 1) {
                resDurationNote.textContent = `Administer ${roundedDose} mcg once daily — vial lasts ${unitLabel}`;
            } else {
                resDurationNote.textContent = `Administer ${roundedDose} mcg × ${roundedDosesPerDay}/day — vial lasts ${unitLabel}`;
            }
        }

        // Progress bar
        if (durationProgressFill) {
            const maxDays = 365;
            const progressPercent = Math.min((days / maxDays) * 100, 100);
            durationProgressFill.style.width = `${progressPercent}%`;
        }

        if (durationEndLabel) {
            durationEndLabel.textContent = `Day ${Math.round(days)}`;
        }

        if (durationResultsPanel) durationResultsPanel.classList.add('active');
    }

    // === Recalculate reconstitution outputs without triggering full calculate ===
    function recalcReconstitution() {
        const weightMg = parseFloat(iWeight.value) || 0;
        const waterMl = parseFloat(iWater.value) || 0;
        const targetMcg = parseFloat(iTarget.value) || 0;

        if (weightMg <= 0 || waterMl <= 0 || targetMcg <= 0) return;

        const concMgPerMl = weightMg / waterMl;
        const targetMg = targetMcg / 1000;
        const volumeMl = targetMg / concMgPerMl;
        const ticks = volumeMl * 100;

        rVolume.textContent = volumeMl.toFixed(2);
        rTicks.textContent = Math.round(ticks);
        rConc.textContent = concMgPerMl.toFixed(1);

        syringeInfo.textContent = getSyringeLabel();
        ticksLabel.textContent = `Units on a ${syringeSize}mL syringe`;

        let fillPercent = Math.min((volumeMl / syringeSize) * 100, 100);
        syringeLiquid.style.width = `${fillPercent}%`;

        const syringeBody = document.querySelector('.syringe-body');
        if (volumeMl > syringeSize) {
            syringeBody.classList.add('overflow');
        } else {
            syringeBody.classList.remove('overflow');
        }

        // Blend results
        if (blendToggle.checked) {
            updateBlendResults(targetMcg, weightMg);
        }
    }

    // === Update Blend Results ===
    function updateBlendResults(targetMcg, totalWeight) {
        const rows = peptideList.querySelectorAll('.blend-row');
        blendResults.classList.add('active');
        blendResults.innerHTML = '';

        if (rows.length === 0) return;

        rows.forEach((row, i) => {
            const nameInput = row.querySelector('.blend-name-input');
            const weightInput = row.querySelector('.blend-weight-input');
            const name = nameInput.value.trim() || `Peptide ${i + 1}`;
            const weight = parseFloat(weightInput.value) || 0;
            const color = peptideColors[i % peptideColors.length];

            const ratio = totalWeight > 0 ? weight / totalWeight : 0;
            const dose = targetMcg * ratio;

            const card = document.createElement('div');
            card.className = 'result-box small blend-result-card';
            card.style.borderColor = color.border;
            card.style.background = `linear-gradient(180deg, ${color.bg} 0%, #04070e 100%)`;
            card.innerHTML = `
                <span class="result-label">${name} per Dose</span>
                <div class="result-value" style="color: ${color.text};">
                    ${dose.toFixed(0)} <span class="unit-sm">mcg</span>
                </div>
            `;
            blendResults.appendChild(card);
        });
    }

    function clearBlendResults() {
        blendResults.classList.remove('active');
        blendResults.innerHTML = '';
    }

    function clearDurationResults() {
        if (durationResultsPanel) durationResultsPanel.classList.remove('active');
    }

    // === Attach Core Listeners ===
    [iWeight, iWater, iTarget].forEach(input => {
        input.addEventListener('input', () => {
            // If duration is on and user edits main target dose, sync it
            if (durationToggle.checked && input === iTarget && durationDoseInput) {
                durationDoseInput.value = input.value;
                lastEditedDurationField = 'dose';
            }
            calculate();
        });
    });

    // Run once on load
    calculate();
});
