module.exports = (sequelize, Sequelize) => {
	return sequelize.define(
		'performance',
		{
			performance_name: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			info_date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			info_place: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			category: {
				type: Sequelize.STRING(16),
				allowNull: false,
			},
			appearance: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			url: {
				type: Sequelize.STRING(200),
				allowNull: false,
			},
		},
		{
			timestamps: false,
		},
	);
};
