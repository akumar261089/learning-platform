import { Course, CourseContent } from '../types';

class CourseService {
  async getCourses(): Promise<Course[]> {
    const response = await fetch('/courses/courses.json');
    if (!response.ok) {
      throw new Error('Failed to load courses');
    }
    return response.json();
  }

  async getCourseContent(coursePath: string): Promise<CourseContent> {
    const response = await fetch(`/${coursePath}`);
    if (!response.ok) {
      throw new Error('Failed to load course content');
    }
    return response.json();
  }
}

export const courseService = new CourseService();