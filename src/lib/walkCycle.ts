/** A front/back depth walk. Head turns must never change the body's gait. */
export const walkCycle = (frame: number, fps = 30) => {
    const phase = frame / fps * (2 * Math.PI / 1.2);
    const swing = Math.sin(phase);
    const bob = 3 * (1 - Math.cos(phase * 2));
    const leg = (x: number, step: number) => {
        const lift = Math.max(0, step) * 28;
        return {
            hipX: x, hipY: -390,
            kneeX: x + step * 3, kneeY: -200 - lift * 0.45,
            ankleX: x + step * 4, ankleY: -25 - lift - bob,
            lift,
        };
    };
    return {swing, bob, left: leg(-34, swing), right: leg(34, -swing)};
};
