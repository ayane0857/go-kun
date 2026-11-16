export type StudySection = {
	id: string;
	title: string;
	from: number;
	to: number;
};

// 学習範囲の追加・変更はここだけ編集すれば反映されます。
export const STUDY_SECTIONS: StudySection[] = [
	{
		id: "column-1",
		title: "小テスト1",
		from: 761,
		to: 780,
	},
	{
		id: "column-2",
		title: "英単語コンクール",
		from: 701,
		to: 833,
	},
];
