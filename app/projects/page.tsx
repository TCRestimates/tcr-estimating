'use client'

import Link from 'next/link'

export default function ProjectsPage() {
  // Mock projects for demo
  const projects = [
    { id: '1', name: 'Sample Project 1' },
    { id: '2', name: 'Sample Project 2' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Projects</h1>
        <p className="text-slate-600 mb-8">Select a project to get started</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/walkthroughs`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-slate-200"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {project.name}
              </h2>
              <p className="text-slate-600 mb-4">Click to view walkthroughs, estimates, and proposals</p>
              <span className="text-blue-600 font-medium">Open Project →</span>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Projects</h3>
          <p className="text-blue-800">
            These are sample projects. Click on any project above to explore the workflow:
            walkthroughs → estimates → proposals → PDF download
          </p>
        </div>
      </div>
    </div>
  )
}
