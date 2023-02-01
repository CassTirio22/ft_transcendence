


const opt_weekday: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: "numeric" };

export const generate_score_data = (user_id: number, score: any[]) => {
    const data: any[] = [];
    let elo = 1000;

    if (score.length) {
        const elem = score[0];
        const date = new Date(elem.date).toLocaleDateString(`fr-FR`, opt_weekday);
        data.push({
            name: date,
            amt: 1000,
        })
    }

    score.map((elem: any) => {
        const date = new Date(elem.date).toLocaleDateString(`fr-FR`, opt_weekday);
        elo += user_id == elem.winner_id ? elem.elo : - elem.elo;
        data.push({
            name: date,
            amt: elo,
        })
    })
    return data;
}