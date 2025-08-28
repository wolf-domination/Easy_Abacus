from app.models import db, Project, User, environment, SCHEMA
from sqlalchemy.sql import text


def seed_projects():
    # Get some users to assign projects to
    user1 = User.query.filter_by(username='Demo').first()
    user2 = User.query.filter_by(username='marnie').first()
    user3 = User.query.filter_by(username='bobbie').first()
    
    # If no users exist, create some sample users first
    if not user1:
        user1 = User(
            username='Demo',
            email='demo@demo.com',
            password='password'
        )
        db.session.add(user1)
    
    if not user2:
        user2 = User(
            username='marnie',
            email='marnie@demo.com', 
            password='password'
        )
        db.session.add(user2)
        
    if not user3:
        user3 = User(
            username='bobbie',
            email='bobbie@demo.com',
            password='password'
        )
        db.session.add(user3)
    
    db.session.commit()

    # Sample projects with diverse topics (5 projects)
    projects = [
        {
            'name': 'Mathematical Visualization Tool',
            'description': 'A web-based abacus for exploring base-n number systems and mathematical concepts.',
            'image_url': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
            'user_id': user1.id
        },
        {
            'name': 'Climate Data Dashboard',
            'description': 'Interactive dashboard displaying real-time climate change data and trends.',
            'image_url': 'https://images.unsplash.com/photo-1569163139394-de44cb06e2b8?w=400&h=300&fit=crop',
            'user_id': user2.id
        },
        {
            'name': 'Recipe Management App',
            'description': 'Digital cookbook for storing, organizing, and sharing favorite recipes.',
            'image_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
            'user_id': user3.id
        },
        {
            'name': 'Personal Finance Tracker',
            'description': 'Track expenses, set budgets, and visualize spending patterns.',
            'image_url': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            'user_id': user1.id
        },
        {
            'name': 'Language Learning Platform',
            'description': 'Interactive platform for learning new languages with spaced repetition.',
            'image_url': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
            'user_id': user2.id
        }
    ]

    for project_data in projects:
        project = Project(**project_data)
        db.session.add(project)

    db.session.commit()


def undo_projects():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.projects RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM projects"))
        
    db.session.commit()