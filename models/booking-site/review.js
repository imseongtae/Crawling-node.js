module.exports = (sequelize, Sequelize) => {
	return sequelize.define(
		'review',
		{
			performance_name: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			subject: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			textarea: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.STRING(30),
				allowNull: false,
			},
		},
		{
			timestamps: false,
		},
	);
};
